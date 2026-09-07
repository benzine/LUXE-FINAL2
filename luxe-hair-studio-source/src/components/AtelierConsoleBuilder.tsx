import { useState, useEffect, useCallback } from "react";
import { configStore, useConfig, type DesignConfig, type Slot } from "../lib/config";
import { builderStore, useBuilder, useBuilderActions, setupBuilderKeyboardShortcuts } from "../lib/builder";
import { Ic, toast } from "./Ornaments";
import { motion, AnimatePresence } from "framer-motion";

/* ── Types ─────────────────────────────────────────────────────── */
type RailPanel = "tree" | "library" | "actions" | "settings";
type InspectorPanel = "design" | "content" | "advanced" | "animations" | "responsive";
type DeviceMode = "desktop" | "tablet" | "mobile";

/* ── Helper Components ────────────────────────────────────────── */
function IconButton({ 
  onClick, 
  icon, 
  label, 
  active = false, 
  disabled = false,
  compact = false 
}: { 
  onClick: () => void; 
  icon: React.ReactNode; 
  label: string; 
  active?: boolean;
  disabled?: boolean;
  compact?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      data-cursor="hand"
      title={label}
      className={`flex items-center justify-center rounded-lg border transition-all ${
        active 
          ? "border-[#d9c25a]/60 bg-[#d9c25a]/10 text-[#d9c25a]" 
          : "border-[#f2e9e1]/15 text-[#c0aea4] hover:text-[#f2e9e1]"
      } ${disabled ? "opacity-30 cursor-not-allowed" : ""} ${compact ? "p-1.5" : "p-2"}`}
    >
      {icon}
    </button>
  );
}

function PanelSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <h4 className="font-mono text-[9px] uppercase tracking-[0.22em] text-[#8f7d74] mb-2">{title}</h4>
      {children}
    </div>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2 border-b border-[#f2e9e1]/8">
      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#c0aea4]">{label}</span>
      <div className="flex items-center gap-3">
        <input 
          type="color" 
          value={value} 
          onChange={(e) => onChange(e.target.value)} 
          className="h-7 w-10 cursor-pointer rounded border border-[#f2e9e1]/15 bg-transparent" 
        />
        <span className="font-mono text-[10px] text-[#8f7d74]">{value}</span>
      </div>
    </div>
  );
}

function SliderField({ 
  label, 
  value, 
  min, 
  max, 
  step, 
  onChange, 
  fmt 
}: { 
  label: string; 
  value: number; 
  min: number; 
  max: number; 
  step: number; 
  onChange: (v: number) => void; 
  fmt?: (v: number) => string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2 border-b border-[#f2e9e1]/8">
      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#c0aea4]">{label}</span>
      <div className="flex items-center gap-3">
        <input 
          type="range" 
          min={min} 
          max={max} 
          step={step} 
          value={value} 
          onChange={(e) => onChange(+e.target.value)} 
          className="w-24 accent-[#d9c25a]" 
        />
        <span className="font-mono w-12 text-right text-[10px] text-[#d9c25a]">
          {fmt ? fmt(value) : value}
        </span>
      </div>
    </div>
  );
}

function ToggleField({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2 border-b border-[#f2e9e1]/8">
      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#c0aea4]">{label}</span>
      <button 
        onClick={() => onChange(!value)} 
        data-cursor="hand" 
        role="switch" 
        aria-checked={value}
        className={`relative h-5 w-9 rounded-full border transition-colors ${
          value ? "border-[#a8b5a0] bg-[#a8b5a0]/30" : "border-[#f2e9e1]/20 bg-transparent"
        }`}
      >
        <span className={`absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full transition-all ${
          value ? "left-5 bg-[#a8b5a0]" : "left-0.5 bg-[#8f7d74]"
        }`} />
      </button>
    </div>
  );
}

/* ── Left Rail Components ─────────────────────────────────────── */
function PageTreePanel({ onSelectSection, onToggleSection, onMoveSection }: {
  onSelectSection: (uid: string, id: string) => void;
  onToggleSection: (uid: string) => void;
  onMoveSection: (from: number, to: number) => void;
}) {
  const cfg = useConfig();
  
  return (
    <div className="p-4">
      <PanelSection title="Page Structure">
        <div className="space-y-1">
          {cfg.slots.map((slot, i) => (
            <motion.div
              key={slot.uid}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={`flex items-center justify-between rounded-lg border px-3 py-2 ${
                slot.enabled 
                  ? "border-[#f2e9e1]/15 bg-[#1c1516]" 
                  : "border-[#f2e9e1]/5 bg-[#1c1516]/50 opacity-60"
              }`}
            >
              <button
                onClick={() => onSelectSection(slot.uid, slot.id)}
                data-cursor="hand"
                className="flex items-center gap-2 flex-1 text-left"
              >
                <Ic.Layer className="h-3.5 w-3.5 text-[#d9c25a]" />
                <span className="font-display text-sm capitalize text-[#f2e9e1]">{slot.id}</span>
              </button>
              <div className="flex items-center gap-1">
                <IconButton
                  onClick={() => i > 0 && onMoveSection(i, i - 1)}
                  icon={<Ic.ChevronUp className="h-3 w-3" />}
                  label="Move up"
                  disabled={i === 0}
                  compact
                />
                <IconButton
                  onClick={() => i < cfg.slots.length - 1 && onMoveSection(i, i + 1)}
                  icon={<Ic.ChevronDown className="h-3 w-3" />}
                  label="Move down"
                  disabled={i === cfg.slots.length - 1}
                  compact
                />
                <button
                  onClick={() => onToggleSection(slot.uid)}
                  data-cursor="hand"
                  className={`ml-1 h-5 w-5 rounded flex items-center justify-center text-[9px] ${
                    slot.enabled 
                      ? "bg-[#a8b5a0]/30 text-[#a8b5a0]" 
                      : "bg-[#f2e9e1]/10 text-[#8f7d74]"
                  }`}
                >
                  {slot.enabled ? "✓" : "○"}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </PanelSection>
    </div>
  );
}

function ModuleLibraryPanel() {
  const modules = [
    { category: "Basic", items: ["Text", "Heading", "Button", "Image", "Video", "Icon", "Divider", "Spacer"] },
    { category: "Content", items: ["Services", "Team", "Testimonials", "Pricing", "Gallery", "Blog Posts"] },
    { category: "Interactive", items: ["Form", "Accordion", "Tabs", "Counter", "Progress Bar", "Timeline"] },
    { category: "Media", items: ["Logo Carousel", "Instagram Feed", "Video Background", "Image Gallery"] },
    { category: "WooCommerce", items: ["Products", "Cart", "Checkout", "My Account"] },
  ];

  return (
    <div className="p-4">
      <PanelSection title="Module Library">
        <div className="mb-3">
          <input 
            type="text" 
            placeholder="Search modules..." 
            className="w-full rounded-lg border border-[#f2e9e1]/15 bg-[#1c1516] px-3 py-2 text-[12px] text-[#f2e9e1] placeholder-[#8f7d74]"
          />
        </div>
        {modules.map((group) => (
          <div key={group.category} className="mb-4">
            <h5 className="font-mono text-[8px] uppercase tracking-[0.2em] text-[#8f7d74] mb-2">{group.category}</h5>
            <div className="grid grid-cols-2 gap-2">
              {group.items.map((item) => (
                <button
                  key={item}
                  data-cursor="hand"
                  className="rounded-lg border border-[#f2e9e1]/15 bg-[#1c1516] px-3 py-2 text-left text-[11px] text-[#c0aea4] hover:border-[#d9c25a]/40 hover:text-[#f2e9e1] transition-all"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        ))}
      </PanelSection>
    </div>
  );
}

function ActionsPanel({ onSave, onExport, onImport, onPreview }: {
  onSave: () => void;
  onExport: () => void;
  onImport: () => void;
  onPreview: () => void;
}) {
  return (
    <div className="p-4">
      <PanelSection title="Actions">
        <div className="space-y-2">
          <button
            onClick={onSave}
            data-cursor="hand"
            className="w-full rounded-lg border border-[#a8b5a0]/50 bg-[#a8b5a0]/10 px-4 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-[#a8b5a0] hover:bg-[#a8b5a0]/20 transition-all"
          >
            <span className="flex items-center justify-center gap-2">
              <Ic.Save className="h-4 w-4" /> Save Changes
            </span>
          </button>
          <button
            onClick={onPreview}
            data-cursor="hand"
            className="w-full rounded-lg border border-[#d9c25a]/50 bg-[#d9c25a]/10 px-4 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-[#d9c25a] hover:bg-[#d9c25a]/20 transition-all"
          >
            <span className="flex items-center justify-center gap-2">
              <Ic.Eye className="h-4 w-4" /> Preview
            </span>
          </button>
          <div className="pt-2 border-t border-[#f2e9e1]/10">
            <button
              onClick={onExport}
              data-cursor="hand"
              className="w-full rounded-lg border border-[#f2e9e1]/15 px-4 py-2 font-mono text-[9px] uppercase tracking-[0.16em] text-[#c0aea4] hover:text-[#f2e9e1] transition-all"
            >
              Export JSON
            </button>
            <button
              onClick={onImport}
              data-cursor="hand"
              className="mt-2 w-full rounded-lg border border-[#f2e9e1]/15 px-4 py-2 font-mono text-[9px] uppercase tracking-[0.16em] text-[#c0aea4] hover:text-[#f2e9e1] transition-all"
            >
              Import JSON
            </button>
          </div>
        </div>
      </PanelSection>
    </div>
  );
}

function SettingsPanel() {
  const cfg = useConfig();
  const set = (patch: Partial<DesignConfig>) => configStore.setDesign(patch);
  const d = cfg.design;

  return (
    <div className="p-4">
      <PanelSection title="Global Settings">
        <ColorField label="Dusty Rose" value={d.rose} onChange={(v) => set({ rose: v })} />
        <ColorField label="Mauve Taupe" value={d.roseDeep} onChange={(v) => set({ roseDeep: v })} />
        <ColorField label="Soft Gold" value={d.gold} onChange={(v) => set({ gold: v })} />
        <ColorField label="Sage Mist" value={d.sage} onChange={(v) => set({ sage: v })} />
        
        <div className="mt-4">
          <h4 className="font-mono text-[9px] uppercase tracking-[0.22em] text-[#8f7d74] mb-2">Typography</h4>
          <div className="py-2 border-b border-[#f2e9e1]/8">
            <select 
              value={d.displayFont} 
              onChange={(e) => set({ displayFont: e.target.value as DesignConfig["displayFont"] })} 
              className="w-full rounded-lg border border-[#f2e9e1]/15 bg-[#1c1516] px-3 py-2 text-[12px] text-[#f2e9e1]"
            >
              <option value="cormorant">Cormorant Garamond</option>
              <option value="fraunces">Fraunces</option>
              <option value="playfair">Playfair Display</option>
            </select>
          </div>
          <SliderField label="Base Font" value={d.baseFontSize} min={14} max={18} step={0.5} onChange={(v) => set({ baseFontSize: v })} fmt={(v) => `${v}px`} />
        </div>

        <div className="mt-4">
          <h4 className="font-mono text-[9px] uppercase tracking-[0.22em] text-[#8f7d74] mb-2">Effects</h4>
          <ToggleField label="Film Grain" value={d.grain} onChange={(v) => set({ grain: v })} />
          <ToggleField label="Motion" value={d.motion} onChange={(v) => set({ motion: v })} />
          <ToggleField label="Custom Cursor" value={d.cursor} onChange={(v) => set({ cursor: v })} />
          <ToggleField label="High Contrast" value={d.contrast} onChange={(v) => set({ contrast: v })} />
        </div>
      </PanelSection>
    </div>
  );
}

/* ── Right Rail (Inspector) Components ────────────────────────── */
function DesignInspector() {
  const cfg = useConfig();
  const d = cfg.design;
  const set = (patch: Partial<DesignConfig>) => configStore.setDesign(patch);

  return (
    <div className="p-4">
      <PanelSection title="Colors">
        <ColorField label="Primary" value={d.rose} onChange={(v) => set({ rose: v })} />
        <ColorField label="Secondary" value={d.roseDeep} onChange={(v) => set({ roseDeep: v })} />
        <ColorField label="Accent" value={d.gold} onChange={(v) => set({ gold: v })} />
        <ColorField label="Highlight" value={d.sage} onChange={(v) => set({ sage: v })} />
      </PanelSection>

      <PanelSection title="Spacing & Layout">
        <SliderField label="Corner Radius" value={d.radius} min={0.3} max={1.8} step={0.1} onChange={(v) => set({ radius: v })} fmt={(v) => `${v}×`} />
        <SliderField label="Section Density" value={d.density} min={0.85} max={1.15} step={0.05} onChange={(v) => set({ density: v })} fmt={(v) => `${v}×`} />
      </PanelSection>

      <PanelSection title="Animation">
        <SliderField label="Speed" value={d.animSpeed} min={0.5} max={2} step={0.1} onChange={(v) => set({ animSpeed: v })} fmt={(v) => `${v}×`} />
        <SliderField label="Hero Pace" value={d.heroScrollSpeed} min={1} max={4} step={0.5} onChange={(v) => set({ heroScrollSpeed: v })} fmt={(v) => `${v}×`} />
        <ToggleField label="Enable Motion" value={d.motion} onChange={(v) => set({ motion: v })} />
      </PanelSection>
    </div>
  );
}

function ContentInspector() {
  const cfg = useConfig();
  
  return (
    <div className="p-4">
      <PanelSection title="Salon Identity">
        <div className="space-y-3">
          <div>
            <label className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#8f7d74]">Salon Name</label>
            <input 
              value={cfg.salon.name} 
              onChange={(e) => configStore.setSalon({ name: e.target.value })}
              className="mt-1 w-full rounded-lg border border-[#f2e9e1]/15 bg-[#1c1516] px-3 py-2 text-[12px] text-[#f2e9e1]"
            />
          </div>
          <div>
            <label className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#8f7d74]">Phone</label>
            <input 
              value={cfg.salon.phone} 
              onChange={(e) => configStore.setSalon({ phone: e.target.value })}
              className="mt-1 w-full rounded-lg border border-[#f2e9e1]/15 bg-[#1c1516] px-3 py-2 text-[12px] text-[#f2e9e1]"
            />
          </div>
          <div>
            <label className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#8f7d74]">Email</label>
            <input 
              value={cfg.salon.email} 
              onChange={(e) => configStore.setSalon({ email: e.target.value })}
              className="mt-1 w-full rounded-lg border border-[#f2e9e1]/15 bg-[#1c1516] px-3 py-2 text-[12px] text-[#f2e9e1]"
            />
          </div>
        </div>
      </PanelSection>

      <PanelSection title="Section Headings">
        {Object.entries(cfg.headings).slice(0, 4).map(([key, h]) => (
          <div key={key} className="mb-3 rounded-lg border border-[#f2e9e1]/10 bg-[#1c1516] p-3">
            <p className="font-mono text-[8px] uppercase tracking-[0.18em] text-[#d9c25a] mb-2">{key}</p>
            <input 
              value={h.title} 
              onChange={(e) => configStore.setContent({ headings: { ...cfg.headings, [key]: { ...h, title: e.target.value } } })}
              className="w-full rounded border border-[#f2e9e1]/15 bg-[#241c1d] px-2 py-1.5 text-[11px] text-[#f2e9e1] mb-2"
            />
            <input 
              value={h.italic} 
              onChange={(e) => configStore.setContent({ headings: { ...cfg.headings, [key]: { ...h, italic: e.target.value } } })}
              className="w-full rounded border border-[#f2e9e1]/15 bg-[#241c1d] px-2 py-1.5 text-[11px] text-[#f2e9e1]"
            />
          </div>
        ))}
      </PanelSection>
    </div>
  );
}

function AdvancedInspector() {
  return (
    <div className="p-4">
      <PanelSection title="Custom CSS">
        <textarea 
          placeholder=".custom-class { /* your styles */ }"
          rows={8}
          className="w-full rounded-lg border border-[#f2e9e1]/15 bg-[#1c1516] px-3 py-2 font-mono text-[11px] text-[#f2e9e1] placeholder-[#8f7d74]"
        />
      </PanelSection>
      
      <PanelSection title="Element Properties">
        <div className="space-y-3">
          <div>
            <label className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#8f7d74]">CSS Class</label>
            <input 
              placeholder="my-custom-class"
              className="mt-1 w-full rounded-lg border border-[#f2e9e1]/15 bg-[#1c1516] px-3 py-2 text-[12px] text-[#f2e9e1]"
            />
          </div>
          <div>
            <label className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#8f7d74]">CSS ID</label>
            <input 
              placeholder="my-element-id"
              className="mt-1 w-full rounded-lg border border-[#f2e9e1]/15 bg-[#1c1516] px-3 py-2 text-[12px] text-[#f2e9e1]"
            />
          </div>
        </div>
      </PanelSection>
    </div>
  );
}

/* ── Section Toolbar ──────────────────────────────────────────── */
function SectionToolbar({ 
  section, 
  onBack, 
  onRename, 
  onDuplicate, 
  onDelete, 
  onToggleVisibility,
  onMoveUp,
  onMoveDown
}: {
  section: Slot;
  onBack: () => void;
  onRename: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onToggleVisibility: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-20 flex items-center justify-between border-b border-[#f2e9e1]/10 bg-[#241c1d]/95 backdrop-blur-sm px-4 py-2"
    >
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          data-cursor="hand"
          className="flex items-center gap-1 rounded-lg border border-[#f2e9e1]/15 px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.16em] text-[#c0aea4] hover:text-[#f2e9e1]"
        >
          <Ic.ArrowLeft className="h-3.5 w-3.5" /> Back
        </button>
        <span className="font-display text-lg capitalize text-[#f2e9e1]">{section.id}</span>
      </div>
      
      <div className="flex items-center gap-1">
        <IconButton onClick={onMoveUp} icon={<Ic.ArrowUp className="h-3.5 w-3.5" />} label="Move Up" compact />
        <IconButton onClick={onMoveDown} icon={<Ic.ArrowDown className="h-3.5 w-3.5" />} label="Move Down" compact />
        <IconButton onClick={onRename} icon={<Ic.Edit2 className="h-3.5 w-3.5" />} label="Rename" compact />
        <IconButton onClick={onToggleVisibility} icon={section.enabled ? <Ic.Eye className="h-3.5 w-3.5" /> : <Ic.EyeOff className="h-3.5 w-3.5" />} label="Toggle Visibility" compact />
        <IconButton onClick={onDuplicate} icon={<Ic.Copy className="h-3.5 w-3.5" />} label="Duplicate" compact />
        <IconButton onClick={onDelete} icon={<Ic.Trash2 className="h-3.5 w-3.5 text-[#e3b6b6]" />} label="Delete" compact />
      </div>
    </motion.div>
  );
}

/* ── Main Console Component ───────────────────────────────────── */
export default function AtelierConsoleBuilder({ onClose }: { onClose: () => void }) {
  const cfg = useConfig();
  const builder = useBuilder();
  const actions = useBuilderActions();
  const [leftPanel, setLeftPanel] = useState<RailPanel>("tree");
  const [rightPanel, setRightPanel] = useState<InspectorPanel>("design");
  const [deviceMode, setDeviceMode] = useState<DeviceMode>("desktop");
  
  const isolatedSection = cfg.slots.find(s => s.uid === builder.isolatedSectionUid);

  /* Setup keyboard shortcuts */
  useEffect(() => {
    const cleanup = setupBuilderKeyboardShortcuts();
    
    /* ESC exits isolation mode */
    const escHandler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && builder.viewMode === "isolated") {
        actions.exitIsolatedMode();
      }
    };
    addEventListener("keydown", escHandler);
    
    return () => {
      cleanup();
      removeEventListener("keydown", escHandler);
    };
  }, [builder.viewMode, actions]);

  const handleSelectSection = useCallback((uid: string, id: string) => {
    actions.selectSection(uid, id);
    actions.enterIsolatedMode(uid, id);
  }, [actions]);

  const handleToggleSection = useCallback((uid: string) => {
    configStore.toggleSlot(uid);
  }, []);

  const handleMoveSection = useCallback((from: number, to: number) => {
    configStore.moveSlot(from, to);
  }, []);

  const handleSave = useCallback(() => {
    toast("Changes saved successfully.");
  }, []);

  const handleExport = useCallback(() => {
    const data = configStore.get();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "atelier-config.json";
    a.click();
    URL.revokeObjectURL(url);
    toast("Configuration exported.");
  }, []);

  const handleImport = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          try {
            const data = JSON.parse(ev.target?.result as string);
            configStore.setContent(data);
            toast("Configuration imported.");
          } catch {
            toast("Invalid JSON file.");
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  }, []);

  const handlePreview = useCallback(() => {
    actions.exitIsolatedMode();
    toast("Preview mode activated.");
  }, []);

  const deviceWidths = {
    desktop: "100%",
    tablet: "768px",
    mobile: "375px",
  };

  return (
    <div className="fixed inset-0 z-[80] flex" role="dialog" aria-label="Atelier Console Builder">
      {/* Overlay background */}
      <div className="absolute inset-0 bg-[#241c1d]/90 backdrop-blur-sm" onClick={onClose} />
      
      {/* LEFT RAIL */}
      <motion.aside
        initial={{ x: -320, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -320, opacity: 0 }}
        className="relative z-30 w-72 border-r border-[#f2e9e1]/10 bg-[#1c1516] shadow-xl"
      >
        {/* Left Rail Header */}
        <div className="flex items-center justify-between border-b border-[#f2e9e1]/10 px-4 py-3">
          <div>
            <p className="font-mono text-[8px] uppercase tracking-[0.3em] text-[#d9c25a]">ATELIER</p>
            <h2 className="font-display text-lg font-medium text-[#f2e9e1]">Builder</h2>
          </div>
          <button onClick={onClose} data-cursor="hand" aria-label="Close console" className="rounded-full p-1.5 text-[#c0aea4] hover:text-[#f2e9e1]">
            <Ic.X className="h-4 w-4" />
          </button>
        </div>

        {/* Left Rail Tabs */}
        <div className="flex border-b border-[#f2e9e1]/10">
          {[
            { id: "tree", icon: <Ic.Layers className="h-4 w-4" />, label: "Tree" },
            { id: "library", icon: <Ic.Grid3X3 className="h-4 w-4" />, label: "Modules" },
            { id: "actions", icon: <Ic.Zap className="h-4 w-4" />, label: "Actions" },
            { id: "settings", icon: <Ic.Settings className="h-4 w-4" />, label: "Settings" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setLeftPanel(tab.id as RailPanel)}
              data-cursor="hand"
              className={`flex-1 flex flex-col items-center justify-center py-3 text-[9px] uppercase tracking-[0.12em] transition-all ${
                leftPanel === tab.id 
                  ? "text-[#d9c25a] border-b-2 border-[#d9c25a]" 
                  : "text-[#8f7d74] hover:text-[#c0aea4]"
              }`}
            >
              {tab.icon}
              <span className="mt-1">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Left Rail Content */}
        <div className="h-[calc(100vh-140px)] overflow-y-auto">
          {leftPanel === "tree" && (
            <PageTreePanel 
              onSelectSection={handleSelectSection}
              onToggleSection={handleToggleSection}
              onMoveSection={handleMoveSection}
            />
          )}
          {leftPanel === "library" && <ModuleLibraryPanel />}
          {leftPanel === "actions" && (
            <ActionsPanel 
              onSave={handleSave}
              onExport={handleExport}
              onImport={handleImport}
              onPreview={handlePreview}
            />
          )}
          {leftPanel === "settings" && <SettingsPanel />}
        </div>
      </motion.aside>

      {/* CENTER STAGE */}
      <main className="relative z-20 flex-1 bg-[#241c1d]">
        {/* Top toolbar */}
        <div className="flex items-center justify-between border-b border-[#f2e9e1]/10 bg-[#1c1516] px-4 py-2">
          <div className="flex items-center gap-4">
            <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#8f7d74]">
              {builder.viewMode === "isolated" ? `Editing: ${isolatedSection?.id}` : "Full Page View"}
            </span>
          </div>
          
          {/* Device preview toggles */}
          <div className="flex items-center gap-2 rounded-lg border border-[#f2e9e1]/15 bg-[#241c1d] p-1">
            {[
              { id: "desktop", icon: <Ic.Monitor className="h-4 w-4" />, label: "Desktop" },
              { id: "tablet", icon: <Ic.Tablet className="h-4 w-4" />, label: "Tablet" },
              { id: "mobile", icon: <Ic.Smartphone className="h-4 w-4" />, label: "Mobile" },
            ].map((device) => (
              <button
                key={device.id}
                onClick={() => setDeviceMode(device.id as DeviceMode)}
                data-cursor="hand"
                className={`rounded p-1.5 transition-all ${
                  deviceMode === device.id 
                    ? "bg-[#d9c25a]/20 text-[#d9c25a]" 
                    : "text-[#8f7d74] hover:text-[#c0aea4]"
                }`}
              >
                {device.icon}
              </button>
            ))}
          </div>

          {/* Undo/Redo */}
          <div className="flex items-center gap-1">
            <IconButton 
              onClick={() => actions.undo()} 
              icon={<Ic.Undo className="h-4 w-4" />} 
              label="Undo (Ctrl+Z)" 
              disabled={!actions.canUndo()}
              compact
            />
            <IconButton 
              onClick={() => actions.redo()} 
              icon={<Ic.Redo className="h-4 w-4" />} 
              label="Redo (Ctrl+Y)" 
              disabled={!actions.canRedo()}
              compact
            />
          </div>
        </div>

        {/* Section toolbar (when in isolated mode) */}
        {builder.viewMode === "isolated" && isolatedSection && (
          <SectionToolbar
            section={isolatedSection}
            onBack={() => actions.exitIsolatedMode()}
            onRename={() => toast("Rename functionality")}
            onDuplicate={() => { configStore.duplicateSlot(isolatedSection.uid); toast("Section duplicated"); }}
            onDelete={() => { configStore.removeSlot(isolatedSection.uid); actions.exitIsolatedMode(); toast("Section deleted"); }}
            onToggleVisibility={() => configStore.toggleSlot(isolatedSection.uid)}
            onMoveUp={() => {}}
            onMoveDown={() => {}}
          />
        )}

        {/* Canvas area */}
        <div 
          className="h-[calc(100vh-180px)] overflow-y-auto bg-[#161112] p-8"
          style={{ 
            display: "flex",
            justifyContent: "center",
          }}
        >
          <div
            className="bg-[#241c1d] shadow-2xl transition-all duration-300"
            style={{
              width: deviceWidths[deviceMode],
              maxWidth: "100%",
              minHeight: "100%",
            }}
          >
            {/* Render the appropriate view based on mode */}
            {builder.viewMode === "full" ? (
              <div className="p-4 text-center text-[#8f7d74]">
                <Ic.Layers className="mx-auto mb-4 h-12 w-12 opacity-30" />
                <p className="font-mono text-[11px] uppercase tracking-[0.18em]">Full Page Preview</p>
                <p className="mt-2 text-[12px]">Select a section from the left panel to edit</p>
              </div>
            ) : (
              <div className="p-4">
                <div className="rounded-lg border border-[#f2e9e1]/10 bg-[#1c1516] p-8">
                  <h3 className="font-display text-2xl capitalize text-[#f2e9e1] mb-4">{isolatedSection?.id} Section</h3>
                  <p className="text-[#8f7d74] text-sm">
                    Section editing interface for {isolatedSection?.id}. 
                    Click elements to edit inline or use the right inspector for detailed controls.
                  </p>
                  <div className="mt-6 grid grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                      <div 
                        key={i}
                        className="rounded-lg border border-[#f2e9e1]/10 bg-[#241c1d] p-4 hover:border-[#d9c25a]/40 cursor-pointer transition-all"
                        onClick={() => actions.selectElement(isolatedSection!.uid, isolatedSection!.id, `element-${i}`)}
                      >
                        <div className="h-20 bg-[#1c1516] rounded mb-3" />
                        <div className="h-3 w-3/4 bg-[#f2e9e1]/20 rounded mb-2" />
                        <div className="h-3 w-1/2 bg-[#f2e9e1]/10 rounded" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* RIGHT RAIL (Inspector) */}
      <motion.aside
        initial={{ x: 320, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 320, opacity: 0 }}
        className="relative z-30 w-80 border-l border-[#f2e9e1]/10 bg-[#1c1516] shadow-xl"
      >
        {/* Right Rail Header */}
        <div className="flex items-center justify-between border-b border-[#f2e9e1]/10 px-4 py-3">
          <h3 className="font-mono text-[9px] uppercase tracking-[0.22em] text-[#8f7d74]">Inspector</h3>
        </div>

        {/* Right Rail Tabs */}
        <div className="flex border-b border-[#f2e9e1]/10 px-2">
          {[
            { id: "design", label: "Design" },
            { id: "content", label: "Content" },
            { id: "advanced", label: "Advanced" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setRightPanel(tab.id as InspectorPanel)}
              data-cursor="hand"
              className={`flex-1 py-2.5 text-[8px] uppercase tracking-[0.14em] transition-all ${
                rightPanel === tab.id 
                  ? "text-[#d9c25a] border-b-2 border-[#d9c25a]" 
                  : "text-[#8f7d74] hover:text-[#c0aea4]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Right Rail Content */}
        <div className="h-[calc(100vh-120px)] overflow-y-auto">
          {rightPanel === "design" && <DesignInspector />}
          {rightPanel === "content" && <ContentInspector />}
          {rightPanel === "advanced" && <AdvancedInspector />}
        </div>
      </motion.aside>
    </div>
  );
}
