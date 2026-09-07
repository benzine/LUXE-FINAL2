import { useState, useRef } from "react";
import { configStore, useConfig, DEFAULT_DESIGN, fileToDataUrl, type DesignConfig, type SiteConfig, type Slot, type Stage, type ServiceCat, type Stylist, type Package, type GalleryItem, type Testimonial, type Product, type Heading, type Amenity, type Scent, type Stat, type QuizQuestion, type BookingAddon, type Tier } from "../lib/config";
import { Ic, toast } from "./Ornaments";

type Tab = "design" | "content" | "mirror" | "layout" | "system";
type ContentSubTab = "identity" | "headings" | "stages" | "services" | "stylists" | "packages" | "gallery" | "testimonials" | "products" | "labels" | "images" | "amenities" | "extras";

const PRESETS: { name: string; design: Partial<DesignConfig> }[] = [
  { name: "Day Salon", design: { rose: "#D4A5A5", roseDeep: "#A67B7B", gold: "#C9B037", sage: "#A8B5A0", displayFont: "cormorant" } },
  { name: "Evening Glamour", design: { rose: "#E3B6B6", roseDeep: "#C89A9A", gold: "#E0C766", sage: "#9FAE97", displayFont: "playfair" } },
  { name: "Sage Atelier", design: { rose: "#B5C4AC", roseDeep: "#8FA386", gold: "#C9B037", sage: "#A8B5A0", displayFont: "fraunces" } },
  { name: "Copper House", design: { rose: "#D9A08F", roseDeep: "#B47462", gold: "#D98E4A", sage: "#B5A98F", displayFont: "fraunces" } },
  { name: "Platinum", design: { rose: "#C8C8CF", roseDeep: "#9C9CA8", gold: "#D8D8DE", sage: "#B4B4BC", displayFont: "playfair" } },
];

const CONTENT_SUBTABS: { id: ContentSubTab; label: string }[] = [
  { id: "identity", label: "Salon" },
  { id: "headings", label: "Headings" },
  { id: "stages", label: "Hero Stages" },
  { id: "services", label: "Services" },
  { id: "stylists", label: "Stylists" },
  { id: "packages", label: "Packages" },
  { id: "gallery", label: "Gallery" },
  { id: "testimonials", label: "Reviews" },
  { id: "products", label: "Products" },
  { id: "labels", label: "UI Text" },
  { id: "images", label: "Images" },
  { id: "amenities", label: "Amenities" },
  { id: "extras", label: "Extras" },
];

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[#f2e9e1]/8 py-3">
      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#c0aea4]">{label}</span>
      <div className="flex items-center gap-3">{children}</div>
    </div>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <Row label={label}>
      <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="h-8 w-12 cursor-pointer rounded-lg border border-[#f2e9e1]/15 bg-transparent" />
      <span className="font-mono text-[11px] text-[#8f7d74]">{value}</span>
    </Row>
  );
}

function SliderField({ label, value, min, max, step, onChange, fmt }: { label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void; fmt?: (v: number) => string }) {
  return (
    <Row label={label}>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(+e.target.value)} className="range-luxe w-32" />
      <span className="font-mono w-14 text-right text-[11px] text-[#d9c25a]">{fmt ? fmt(value) : value}</span>
    </Row>
  );
}

function ToggleField({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <Row label={label}>
      <button onClick={() => onChange(!value)} data-cursor="hand" role="switch" aria-checked={value}
        className={`relative h-6 w-11 rounded-full border transition-colors ${value ? "border-[#a8b5a0] bg-[#a8b5a0]/30" : "border-[#f2e9e1]/20 bg-transparent"}`}>
        <span className={`absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full transition-all ${value ? "left-6 bg-[#a8b5a0]" : "left-1 bg-[#8f7d74]"}`} />
      </button>
    </Row>
  );
}

function TextField({ label, value, onChange, placeholder, wide = false }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; wide?: boolean }) {
  return (
    <Row label={label}>
      <input value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)}
        className={`rounded-lg border border-[#f2e9e1]/15 bg-[#1c1516] px-3 py-1.5 text-[12px] text-[#f2e9e1] ${wide ? "w-64" : "w-44"}`} />
    </Row>
  );
}

function TextAreaField({ label, value, onChange, rows = 2 }: { label: string; value: string; onChange: (v: string) => void; rows?: number }) {
  return (
    <div className="border-b border-[#f2e9e1]/8 py-3">
      <div className="flex items-start justify-between gap-4">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#c0aea4] pt-1">{label}</span>
        <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={rows}
          className="rounded-lg border border-[#f2e9e1]/15 bg-[#1c1516] px-3 py-2 text-[12px] text-[#f2e9e1] w-64 resize-y" />
      </div>
    </div>
  );
}

function NumberField({ label, value, onChange, suffix, width = "w-20" }: { label: string; value: number; onChange: (v: number) => void; suffix?: string; width?: string }) {
  return (
    <Row label={label}>
      <div className="flex items-center gap-1">
        <input type="number" value={value} onChange={(e) => onChange(+e.target.value)}
          className={`rounded-lg border border-[#f2e9e1]/15 bg-[#1c1516] px-2 py-1 text-[12px] text-[#f2e9e1] ${width}`} />
        {suffix && <span className="font-mono text-[10px] text-[#8f7d74]">{suffix}</span>}
      </div>
    </Row>
  );
}

function SectionCard({ title, accent, children, onRemove, removable }: { title: string; accent?: string; children: React.ReactNode; onRemove?: () => void; removable?: boolean }) {
  return (
    <div className="mt-3 rounded-[1rem_1rem_0.3rem_1rem] border border-[#f2e9e1]/10 bg-[#1c1516] p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="font-mono text-[9px] uppercase tracking-[0.18em]" style={{ color: accent || "#d9c25a" }}>{title}</p>
        {removable && onRemove && (
          <button onClick={onRemove} data-cursor="hand" className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#c98d8d] hover:text-[#e3b6b6]">Remove</button>
        )}
      </div>
      {children}
    </div>
  );
}

function AddButton({ onClick, label = "Add" }: { onClick: () => void; label?: string }) {
  return (
    <button onClick={onClick} data-cursor="hand"
      className="mt-3 rounded-full border border-[#a8b5a0]/50 px-4 py-2 font-mono text-[9px] uppercase tracking-[0.18em] text-[#a8b5a0] hover:bg-[#a8b5a0]/10">+ {label}</button>
  );
}

export default function Console({ onClose }: { onClose: () => void }) {
  const cfg = useConfig();
  const [tab, setTab] = useState<Tab>("design");
  const [contentSub, setContentSub] = useState<ContentSubTab>("identity");
  const d = cfg.design;
  const set = (patch: Partial<DesignConfig>) => configStore.setDesign(patch);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageUploadKey, setImageUploadKey] = useState<string>("");

  const TABS: { id: Tab; label: string }[] = [
    { id: "design", label: "Design" }, { id: "content", label: "Content" }, { id: "mirror", label: "Mirror" }, { id: "layout", label: "Sections" }, { id: "system", label: "System" },
  ];

  const handleImageUploadClick = (key: string) => {
    setImageUploadKey(key);
    fileInputRef.current?.click();
  };

  const handleImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !imageUploadKey) return;
    try {
      const dataUrl = await fileToDataUrl(file);
      configStore.setImage(imageUploadKey, dataUrl);
      toast("Image uploaded.");
    } catch {
      toast("Image upload failed.");
    }
    e.target.value = "";
  };

  /* ── Helpers to update nested arrays ── */
  const updateItem = <K extends keyof Omit<SiteConfig, "design" | "salon" | "labels" | "images" | "mirror" | "headings" | "slots">>(
    key: K, index: number, patch: Partial<SiteConfig[K][number]>
  ) => {
    const arr = (cfg[key] as unknown as SiteConfig[K][number][]).map((item, i) =>
      i === index ? { ...item, ...patch } : item
    );
    configStore.setContent({ [key]: arr } as any);
  };

  const removeItem = <K extends keyof Omit<SiteConfig, "design" | "salon" | "labels" | "images" | "mirror" | "headings" | "slots">>(
    key: K, index: number
  ) => {
    const arr = (cfg[key] as unknown as SiteConfig[K][number][]).filter((_, i) => i !== index);
    configStore.setContent({ [key]: arr } as any);
  };

  return (
    <div className="fixed inset-0 z-[80]" role="dialog" aria-label="Atelier Console">
      <div className="absolute inset-0 bg-basedeep/70 backdrop-blur-sm" onClick={onClose} />
      <div className="phase-swap absolute right-0 top-0 h-full w-[min(94vw,460px)] overflow-y-auto border-l border-[#f2e9e1]/10 bg-[#241c1d] p-6 text-[#f2e9e1] shadow-[var(--shadow-lift)] sm:p-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-[#d9c25a]">Atelier Console</p>
            <h2 className="font-display mt-1 text-2xl font-medium">Customize everything</h2>
          </div>
          <button onClick={onClose} data-cursor="hand" aria-label="Close console" className="flex h-9 w-9 items-center justify-center rounded-full border border-[#f2e9e1]/15 text-[#c0aea4] hover:text-[#f2e9e1]"><Ic.X className="h-4 w-4" /></button>
        </div>

        <div className="mt-6 flex gap-2 flex-wrap">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} data-cursor="hand"
              className={`rounded-full border px-4 py-2 font-mono text-[9px] uppercase tracking-[0.16em] transition-all ${tab === t.id ? "border-[#d9c25a]/60 bg-[#d9c25a]/10 text-[#d9c25a]" : "border-[#f2e9e1]/15 text-[#c0aea4]"}`}>{t.label}</button>
          ))}
        </div>

        {/* Hidden file input for image uploads */}
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageFile} />

        {tab === "design" && (
          <div className="mt-6">
            <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-[#8f7d74]">Palette</p>
            <ColorField label="Dusty Rose" value={d.rose} onChange={(v) => set({ rose: v })} />
            <ColorField label="Mauve Taupe" value={d.roseDeep} onChange={(v) => set({ roseDeep: v })} />
            <ColorField label="Soft Gold" value={d.gold} onChange={(v) => set({ gold: v })} />
            <ColorField label="Sage Mist" value={d.sage} onChange={(v) => set({ sage: v })} />

            <p className="font-mono mt-6 text-[9px] uppercase tracking-[0.22em] text-[#8f7d74]">Typography & scale</p>
            <Row label="Display face">
              <select value={d.displayFont} onChange={(e) => set({ displayFont: e.target.value as DesignConfig["displayFont"] })} className="rounded-lg border border-[#f2e9e1]/15 bg-[#1c1516] px-3 py-1.5 text-[12px] text-[#f2e9e1]">
                <option value="cormorant">Cormorant Garamond</option><option value="fraunces">Fraunces</option><option value="playfair">Playfair Display</option>
              </select>
            </Row>
            <SliderField label="Base font size" value={d.baseFontSize} min={14} max={18} step={0.5} onChange={(v) => set({ baseFontSize: v })} fmt={(v) => `${v}px`} />
            <SliderField label="Section density" value={d.density} min={0.85} max={1.15} step={0.05} onChange={(v) => set({ density: v })} fmt={(v) => `${v}×`} />

            <p className="font-mono mt-6 text-[9px] uppercase tracking-[0.22em] text-[#8f7d74]">Shape & motion</p>
            <SliderField label="Corner radius" value={d.radius} min={0.3} max={1.8} step={0.1} onChange={(v) => set({ radius: v })} fmt={(v) => `${v}×`} />
            <SliderField label="Hero scroll pace" value={d.heroScrollSpeed} min={1} max={4} step={0.5} onChange={(v) => set({ heroScrollSpeed: v })} fmt={(v) => `${v}×`} />
            <ToggleField label="Film grain" value={d.grain} onChange={(v) => set({ grain: v })} />
            <ToggleField label="Motion" value={d.motion} onChange={(v) => set({ motion: v })} />
            <ToggleField label="Custom cursor" value={d.cursor} onChange={(v) => set({ cursor: v })} />
            <ToggleField label="High contrast" value={d.contrast} onChange={(v) => set({ contrast: v })} />
            <ToggleField label="Right dock (book / concierge)" value={d.dockRight} onChange={(v) => set({ dockRight: v })} />
            <ToggleField label="Left dock (language / access)" value={d.dockLeft} onChange={(v) => set({ dockLeft: v })} />

            <p className="font-mono mt-6 text-[9px] uppercase tracking-[0.22em] text-[#8f7d74]">Presets</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {PRESETS.map((p) => (
                <button key={p.name} onClick={() => { set(p.design); toast(`${p.name} preset applied.`); }} data-cursor="hand"
                  className="rounded-full border border-[#f2e9e1]/15 px-4 py-2 font-mono text-[9px] uppercase tracking-[0.14em] text-[#c0aea4] transition-all hover:border-[#d9c25a]/50 hover:text-[#d9c25a]">{p.name}</button>
              ))}
            </div>
            <button onClick={() => { set({ ...DEFAULT_DESIGN }); toast("Design reset to defaults."); }} data-cursor="hand"
              className="mt-6 rounded-full border border-[#e3b6b6]/40 px-5 py-2.5 font-mono text-[9px] uppercase tracking-[0.16em] text-[#e3b6b6] hover:bg-[#e3b6b6]/10">Reset design defaults</button>
          </div>
        )}

        {tab === "content" && (
          <div className="mt-6">
            {/* Content sub-tabs */}
            <div className="flex gap-1.5 flex-wrap mb-4">
              {CONTENT_SUBTABS.map((s) => (
                <button key={s.id} onClick={() => setContentSub(s.id)} data-cursor="hand"
                  className={`rounded-full border px-3 py-1.5 font-mono text-[8px] uppercase tracking-[0.14em] transition-all ${contentSub === s.id ? "border-[#d9c25a]/60 bg-[#d9c25a]/10 text-[#d9c25a]" : "border-[#f2e9e1]/10 text-[#8f7d74] hover:text-[#c0aea4]"}`}>{s.label}</button>
              ))}
            </div>

            {/* ── Identity ── */}
            {contentSub === "identity" && (
              <>
                <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-[#8f7d74]">Salon identity</p>
                <TextField label="Name" value={cfg.salon.name} onChange={(v) => configStore.setSalon({ name: v })} wide />
                <TextField label="Wordmark" value={cfg.salon.word} onChange={(v) => configStore.setSalon({ word: v })} />
                <TextField label="Subtitle" value={cfg.salon.sub} onChange={(v) => configStore.setSalon({ sub: v })} wide />
                <TextField label="Address" value={cfg.salon.address} onChange={(v) => configStore.setSalon({ address: v })} wide />
                <TextField label="City" value={cfg.salon.city} onChange={(v) => configStore.setSalon({ city: v })} wide />
                <TextField label="Phone" value={cfg.salon.phone} onChange={(v) => configStore.setSalon({ phone: v })} />
                <TextField label="Email" value={cfg.salon.email} onChange={(v) => configStore.setSalon({ email: v })} wide />
                <TextAreaField label="Copyright" value={cfg.salon.copyright} onChange={(v) => configStore.setSalon({ copyright: v })} />
              </>
            )}

            {/* ── Headings ── */}
            {contentSub === "headings" && (
              <>
                <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-[#8f7d74]">Section headings</p>
                {Object.entries(cfg.headings).map(([key, h]: [string, Heading]) => (
                  <SectionCard key={key} title={key}>
                    <input value={h.title} placeholder="Title" onChange={(e) => configStore.setContent({ headings: { ...cfg.headings, [key]: { ...h, title: e.target.value } } })}
                      className="mt-1 w-full rounded-lg border border-[#f2e9e1]/15 bg-[#241c1d] px-3 py-1.5 text-[12px] text-[#f2e9e1]" />
                    <input value={h.italic} placeholder="Italic phrase" onChange={(e) => configStore.setContent({ headings: { ...cfg.headings, [key]: { ...h, italic: e.target.value } } })}
                      className="mt-2 w-full rounded-lg border border-[#f2e9e1]/15 bg-[#241c1d] px-3 py-1.5 text-[12px] italic text-[#c0aea4]" />
                    <textarea value={h.desc} placeholder="Description" onChange={(e) => configStore.setContent({ headings: { ...cfg.headings, [key]: { ...h, desc: e.target.value } } })} rows={2}
                      className="mt-2 w-full rounded-lg border border-[#f2e9e1]/15 bg-[#241c1d] px-3 py-1.5 text-[11px] text-[#8f7d74] resize-y" />
                  </SectionCard>
                ))}
              </>
            )}

            {/* ── Hero Stages ── */}
            {contentSub === "stages" && (
              <>
                <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-[#8f7d74]">Hero stages — scroll reveal</p>
                {cfg.stages.map((s: Stage, i: number) => (
                  <SectionCard key={i} title={`Stage ${i + 1}`} accent={s.accent} removable={cfg.stages.length > 1} onRemove={() => removeItem("stages", i)}>
                    <TextField label="Kicker" value={s.kicker} onChange={(v) => updateItem("stages", i, { kicker: v })} />
                    <TextField label="Line 1" value={s.line1} onChange={(v) => updateItem("stages", i, { line1: v })} wide />
                    <TextField label="Line 2" value={s.line2} onChange={(v) => updateItem("stages", i, { line2: v })} wide />
                    <TextAreaField label="Subtitle" value={s.sub} onChange={(v) => updateItem("stages", i, { sub: v })} />
                    <TextField label="Image URL" value={s.image} onChange={(v) => updateItem("stages", i, { image: v })} wide />
                    <Row label="Accent">
                      <input type="color" value={s.accent} onChange={(e) => updateItem("stages", i, { accent: e.target.value })} className="h-7 w-10 cursor-pointer rounded border border-[#f2e9e1]/15 bg-transparent" />
                    </Row>
                  </SectionCard>
                ))}
                <AddButton onClick={() => configStore.setContent({ stages: [...cfg.stages, { kicker: "New", line1: "Line one", line2: "Line two", sub: "Description", image: "", accent: "#d9c25a" }] })} label="Add stage" />
              </>
            )}

            {/* ── Services ── */}
            {contentSub === "services" && (
              <>
                <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-[#8f7d74]">Service categories</p>
                {cfg.services.map((cat: ServiceCat, ci: number) => (
                  <SectionCard key={ci} title={cat.label} accent="#e0b2b2" removable={cfg.services.length > 1} onRemove={() => removeItem("services", ci)}>
                    <TextField label="Category" value={cat.label} onChange={(v) => updateItem("services", ci, { label: v })} />
                    <TextAreaField label="Note" value={cat.note} onChange={(v) => updateItem("services", ci, { note: v })} />
                    <p className="font-mono text-[8px] uppercase tracking-[0.16em] text-[#8f7d74] mt-3 mb-1">Services in this category</p>
                    {cat.items.map((it, ii) => (
                      <div key={ii} className="rounded-lg border border-[#f2e9e1]/8 bg-[#241c1d] p-3 mb-2">
                        <div className="flex justify-between items-start">
                          <span className="font-mono text-[8px] uppercase tracking-[0.14em] text-[#a8b5a0]">#{ii + 1}</span>
                          <button onClick={() => {
                            const newItems = cat.items.filter((_, idx) => idx !== ii);
                            updateItem("services", ci, { items: newItems } as any);
                          }} data-cursor="hand" className="font-mono text-[8px] text-[#c98d8d] hover:text-[#e3b6b6]">×</button>
                        </div>
                        <input value={it.name} placeholder="Service name" onChange={(e) => {
                          const newItems = cat.items.map((x, idx) => idx === ii ? { ...x, name: e.target.value } : x);
                          updateItem("services", ci, { items: newItems } as any);
                        }} className="mt-1 w-full rounded border border-[#f2e9e1]/10 bg-[#1c1516] px-2 py-1 text-[11px] text-[#f2e9e1]" />
                        <textarea value={it.desc} placeholder="Description" onChange={(e) => {
                          const newItems = cat.items.map((x, idx) => idx === ii ? { ...x, desc: e.target.value } : x);
                          updateItem("services", ci, { items: newItems } as any);
                        }} rows={1} className="mt-1 w-full rounded border border-[#f2e9e1]/10 bg-[#1c1516] px-2 py-1 text-[10px] text-[#8f7d74] resize-y" />
                        <div className="flex gap-2 mt-1">
                          <input type="number" value={it.dur} placeholder="Min" onChange={(e) => {
                            const newItems = cat.items.map((x, idx) => idx === ii ? { ...x, dur: +e.target.value } : x);
                            updateItem("services", ci, { items: newItems } as any);
                          }} className="w-16 rounded border border-[#f2e9e1]/10 bg-[#1c1516] px-2 py-1 text-[10px] text-[#f2e9e1]" />
                          <span className="font-mono text-[9px] text-[#8f7d74] self-center">min</span>
                          <span className="font-mono text-[11px] text-[#d9c25a] self-center ml-auto">£</span>
                          <input type="number" value={it.price} placeholder="Price" onChange={(e) => {
                            const newItems = cat.items.map((x, idx) => idx === ii ? { ...x, price: +e.target.value } : x);
                            updateItem("services", ci, { items: newItems } as any);
                          }} className="w-16 rounded border border-[#f2e9e1]/10 bg-[#1c1516] px-2 py-1 text-[10px] text-[#f2e9e1]" />
                        </div>
                      </div>
                    ))}
                    <button onClick={() => {
                      const newItems = [...cat.items, { name: "New service", desc: "Description", dur: 60, price: 80 }];
                      updateItem("services", ci, { items: newItems } as any);
                    }} data-cursor="hand" className="mt-1 text-[10px] text-[#a8b5a0] hover:text-[#c5d2bd]">+ Add service to category</button>
                  </SectionCard>
                ))}
                <AddButton onClick={() => configStore.setContent({ services: [...cfg.services, { label: "New Category", note: "Category note", items: [{ name: "New service", desc: "Description", dur: 60, price: 80 }] }] })} label="Add category" />
              </>
            )}

            {/* ── Stylists ── */}
            {contentSub === "stylists" && (
              <>
                <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-[#8f7d74]">The atelier team</p>
                {cfg.stylists.map((st: Stylist, i: number) => (
                  <SectionCard key={st.id} title={st.name} accent="#a8b5a0" removable={cfg.stylists.length > 1} onRemove={() => removeItem("stylists", i)}>
                    <TextField label="Name" value={st.name} onChange={(v) => updateItem("stylists", i, { name: v })} wide />
                    <TextField label="Title" value={st.title} onChange={(v) => updateItem("stylists", i, { title: v })} wide />
                    <TextField label="Specialty" value={st.specialty} onChange={(v) => updateItem("stylists", i, { specialty: v })} wide />
                    <TextField label="Personality" value={st.personality} onChange={(v) => updateItem("stylists", i, { personality: v })} wide />
                    <TextAreaField label="Quote" value={st.quote} onChange={(v) => updateItem("stylists", i, { quote: v })} />
                    <TextField label="Image URL" value={st.img} onChange={(v) => updateItem("stylists", i, { img: v })} wide />
                  </SectionCard>
                ))}
                <AddButton onClick={() => configStore.setContent({ stylists: [...cfg.stylists, { id: `st-${Date.now().toString(36)}`, name: "New Stylist", title: "Stylist", specialty: "Specialty", personality: "Personality", quote: "Quote", img: "" }] })} label="Add stylist" />
              </>
            )}

            {/* ── Packages ── */}
            {contentSub === "packages" && (
              <>
                <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-[#8f7d74]">Signature packages</p>
                {cfg.packages.map((p: Package, i: number) => (
                  <SectionCard key={i} title={p.name} accent="#d9c25a" removable={cfg.packages.length > 1} onRemove={() => removeItem("packages", i)}>
                    <TextField label="Name" value={p.name} onChange={(v) => updateItem("packages", i, { name: v })} wide />
                    <TextField label="Tag" value={p.tag} onChange={(v) => updateItem("packages", i, { tag: v })} />
                    <TextAreaField label="Description" value={p.desc} onChange={(v) => updateItem("packages", i, { desc: v })} />
                    <TextField label="Duration" value={p.dur} onChange={(v) => updateItem("packages", i, { dur: v })} />
                    <NumberField label="Price" value={p.price} onChange={(v) => updateItem("packages", i, { price: v })} suffix="£" />
                  </SectionCard>
                ))}
                <AddButton onClick={() => configStore.setContent({ packages: [...cfg.packages, { name: "New Package", tag: "Tag", desc: "Description", dur: "2h", price: 200 }] })} label="Add package" />
              </>
            )}

            {/* ── Gallery ── */}
            {contentSub === "gallery" && (
              <>
                <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-[#8f7d74]">Transformations gallery</p>
                {cfg.gallery.map((g: GalleryItem, i: number) => (
                  <SectionCard key={g.id} title={`#${g.id} · ${g.title}`} accent="#e0b2b2" removable={cfg.gallery.length > 1} onRemove={() => removeItem("gallery", i)}>
                    <TextField label="Title" value={g.title} onChange={(v) => updateItem("gallery", i, { title: v })} wide />
                    <Row label="Kind">
                      <select value={g.kind} onChange={(e) => updateItem("gallery", i, { kind: e.target.value })} className="rounded-lg border border-[#f2e9e1]/15 bg-[#1c1516] px-2 py-1 text-[11px] text-[#f2e9e1]">
                        <option value="colour">Colour</option><option value="cut">Cut</option><option value="bridal">Bridal</option><option value="styling">Styling</option>
                      </select>
                    </Row>
                    <TextField label="Stylist" value={g.stylist} onChange={(v) => updateItem("gallery", i, { stylist: v })} />
                    <TextAreaField label="Client quote" value={g.quote} onChange={(v) => updateItem("gallery", i, { quote: v })} />
                    <TextField label="Image URL" value={g.image} onChange={(v) => updateItem("gallery", i, { image: v })} wide />
                  </SectionCard>
                ))}
                <AddButton onClick={() => configStore.setContent({ gallery: [...cfg.gallery, { id: Date.now(), title: "New Look", kind: "colour", stylist: "Stylist", quote: "Client quote", image: "" }] })} label="Add gallery item" />
              </>
            )}

            {/* ── Testimonials ── */}
            {contentSub === "testimonials" && (
              <>
                <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-[#8f7d74]">Client reviews</p>
                {cfg.testimonials.map((t: Testimonial, i: number) => (
                  <SectionCard key={i} title={t.name} accent="#a8b5a0" removable={cfg.testimonials.length > 1} onRemove={() => removeItem("testimonials", i)}>
                    <TextAreaField label="Quote" value={t.quote} onChange={(v) => updateItem("testimonials", i, { quote: v })} rows={3} />
                    <TextField label="Name" value={t.name} onChange={(v) => updateItem("testimonials", i, { name: v })} />
                    <TextField label="Service" value={t.service} onChange={(v) => updateItem("testimonials", i, { service: v })} />
                    <NumberField label="Stars" value={t.stars} onChange={(v) => updateItem("testimonials", i, { stars: Math.min(5, Math.max(1, v)) })} />
                  </SectionCard>
                ))}
                <AddButton onClick={() => configStore.setContent({ testimonials: [...cfg.testimonials, { quote: "Five stars.", name: "New Client", service: "Service", stars: 5 }] })} label="Add review" />
              </>
            )}

            {/* ── Products ── */}
            {contentSub === "products" && (
              <>
                <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-[#8f7d74]">The apothecary</p>
                {cfg.products.map((p: Product, i: number) => (
                  <SectionCard key={i} title={p.name} accent="#d9c25a" removable={cfg.products.length > 1} onRemove={() => removeItem("products", i)}>
                    <TextField label="Name" value={p.name} onChange={(v) => updateItem("products", i, { name: v })} wide />
                    <TextField label="Kind / size" value={p.kind} onChange={(v) => updateItem("products", i, { kind: v })} wide />
                    <TextAreaField label="Description" value={p.desc} onChange={(v) => updateItem("products", i, { desc: v })} />
                    <NumberField label="Price" value={p.price} onChange={(v) => updateItem("products", i, { price: v })} suffix="£" />
                  </SectionCard>
                ))}
                <AddButton onClick={() => configStore.setContent({ products: [...cfg.products, { name: "New Product", kind: "Kind · size", desc: "Description", price: 30 }] })} label="Add product" />
              </>
            )}

            {/* ── Labels ── */}
            {contentSub === "labels" && (
              <>
                <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-[#8f7d74]">UI text & labels</p>
                <p className="text-[11px] text-[#8f7d74] mb-3">Every visitor-facing string. Empty values fall back to English defaults.</p>
                {Object.entries(cfg.labels).map(([key, val]) => (
                  <div key={key} className="border-b border-[#f2e9e1]/8 py-2">
                    <p className="font-mono text-[8px] uppercase tracking-[0.14em] text-[#8f7d74]">{key}</p>
                    <input value={val} onChange={(e) => configStore.setLabel(key, e.target.value)}
                      className="mt-1 w-full rounded border border-[#f2e9e1]/10 bg-[#1c1516] px-2 py-1 text-[11px] text-[#f2e9e1]" />
                  </div>
                ))}
              </>
            )}

            {/* ── Images ── */}
            {contentSub === "images" && (
              <>
                <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-[#8f7d74]">Image slots</p>
                <p className="text-[11px] text-[#8f7d74] mb-3">Upload or point each slot at your own photography. Empty = bundled editorial defaults.</p>
                {Object.entries(cfg.images).map(([key, val]) => (
                  <div key={key} className="border-b border-[#f2e9e1]/8 py-3">
                    <div className="flex items-center justify-between">
                      <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#d9c25a]">{key}</p>
                      <div className="flex gap-2">
                        <button onClick={() => handleImageUploadClick(key)} data-cursor="hand"
                          className="rounded-full border border-[#a8b5a0]/40 px-3 py-1 font-mono text-[8px] uppercase tracking-[0.14em] text-[#a8b5a0] hover:bg-[#a8b5a0]/10">Upload</button>
                        {val && (
                          <button onClick={() => configStore.setImage(key, "")} data-cursor="hand"
                            className="rounded-full border border-[#c98d8d]/40 px-3 py-1 font-mono text-[8px] uppercase tracking-[0.14em] text-[#c98d8d] hover:bg-[#c98d8d]/10">Clear</button>
                        )}
                      </div>
                    </div>
                    <input value={val} placeholder="Or paste a URL…" onChange={(e) => configStore.setImage(key, e.target.value)}
                      className="mt-2 w-full rounded border border-[#f2e9e1]/10 bg-[#1c1516] px-2 py-1 text-[10px] text-[#8f7d74]" />
                  </div>
                ))}
              </>
            )}

            {/* ── Amenities ── */}
            {contentSub === "amenities" && (
              <>
                <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-[#8f7d74]">Sensory salon amenities</p>
                {cfg.amenities.map((a: Amenity, i: number) => (
                  <SectionCard key={i} title={`Amenity ${i + 1}`} accent="#a8b5a0" removable={cfg.amenities.length > 1} onRemove={() => removeItem("amenities", i)}>
                    <TextField label="Icon" value={a.icon} onChange={(v) => updateItem("amenities", i, { icon: v })} />
                    <TextField label="Title" value={a.title} onChange={(v) => updateItem("amenities", i, { title: v })} wide />
                    <TextAreaField label="Description" value={a.desc} onChange={(v) => updateItem("amenities", i, { desc: v })} />
                  </SectionCard>
                ))}
                <AddButton onClick={() => configStore.setContent({ amenities: [...cfg.amenities, { icon: "star", title: "New amenity", desc: "Description" }] })} label="Add amenity" />
              </>
            )}

            {/* ── Extras ── */}
            {contentSub === "extras" && (
              <>
                <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-[#8f7d74]">Scents</p>
                {cfg.scents.map((s: Scent, i: number) => (
                  <div key={i} className="flex items-center justify-between gap-3 border-b border-[#f2e9e1]/8 py-2">
                    <input value={s.name} onChange={(e) => updateItem("scents", i, { name: e.target.value })} className="w-28 rounded border border-[#f2e9e1]/10 bg-[#1c1516] px-2 py-1 text-[11px] text-[#f2e9e1]" />
                    <input value={s.note} onChange={(e) => updateItem("scents", i, { note: e.target.value })} className="w-28 rounded border border-[#f2e9e1]/10 bg-[#1c1516] px-2 py-1 text-[11px] text-[#8f7d74]" />
                    <button onClick={() => removeItem("scents", i)} data-cursor="hand" className="text-[#c98d8d] hover:text-[#e3b6b6] text-sm">×</button>
                  </div>
                ))}
                <AddButton onClick={() => configStore.setContent({ scents: [...cfg.scents, { name: "New", note: "Note" }] })} label="Add scent" />

                <p className="font-mono mt-8 text-[9px] uppercase tracking-[0.22em] text-[#8f7d74]">Stats</p>
                {cfg.stats.map((s: Stat, i: number) => (
                  <div key={i} className="flex items-center justify-between gap-3 border-b border-[#f2e9e1]/8 py-2">
                    <input value={s.value} onChange={(e) => updateItem("stats", i, { value: e.target.value })} className="w-20 rounded border border-[#f2e9e1]/10 bg-[#1c1516] px-2 py-1 text-[11px] text-[#d9c25a] font-display" />
                    <input value={s.label} onChange={(e) => updateItem("stats", i, { label: e.target.value })} className="flex-1 rounded border border-[#f2e9e1]/10 bg-[#1c1516] px-2 py-1 text-[11px] text-[#f2e9e1]" />
                    <button onClick={() => removeItem("stats", i)} data-cursor="hand" className="text-[#c98d8d] hover:text-[#e3b6b6] text-sm">×</button>
                  </div>
                ))}
                <AddButton onClick={() => configStore.setContent({ stats: [...cfg.stats, { value: "New", label: "Label" }] })} label="Add stat" />

                <p className="font-mono mt-8 text-[9px] uppercase tracking-[0.22em] text-[#8f7d74]">Marquee words</p>
                <input value={cfg.marqueeWords.join(", ")} onChange={(e) => configStore.setContent({ marqueeWords: e.target.value.split(",").map((w) => w.trim()).filter(Boolean) })}
                  className="mt-2 w-full rounded-lg border border-[#f2e9e1]/15 bg-[#1c1516] px-3 py-2 text-[11px] text-[#f2e9e1]" />
                <p className="text-[10px] text-[#8f7d74] mt-1">Comma-separated</p>

                <p className="font-mono mt-8 text-[9px] uppercase tracking-[0.22em] text-[#8f7d74]">Booking add-ons</p>
                {cfg.bookingAddons.map((b: BookingAddon, i: number) => (
                  <SectionCard key={i} title={`Extra ${i + 1}`} accent="#d9c25a" removable={cfg.bookingAddons.length > 1} onRemove={() => removeItem("bookingAddons", i)}>
                    <TextField label="Name" value={b.name} onChange={(v) => updateItem("bookingAddons", i, { name: v })} wide />
                    <TextAreaField label="Description" value={b.desc} onChange={(v) => updateItem("bookingAddons", i, { desc: v })} />
                    <TextField label="Icon" value={b.icon} onChange={(v) => updateItem("bookingAddons", i, { icon: v })} />
                    <NumberField label="Price" value={b.price} onChange={(v) => updateItem("bookingAddons", i, { price: v })} suffix="£" />
                  </SectionCard>
                ))}
                <AddButton onClick={() => configStore.setContent({ bookingAddons: [...cfg.bookingAddons, { name: "New extra", desc: "Description", price: 20, icon: "star" }] })} label="Add extra" />

                <p className="font-mono mt-8 text-[9px] uppercase tracking-[0.22em] text-[#8f7d74]">Pricing tiers</p>
                {cfg.tiers.map((t: Tier, i: number) => (
                  <SectionCard key={i} title={t.name} accent="#a8b5a0" removable={cfg.tiers.length > 1} onRemove={() => removeItem("tiers", i)}>
                    <TextField label="Name" value={t.name} onChange={(v) => updateItem("tiers", i, { name: v })} />
                    <TextField label="Level" value={t.level} onChange={(v) => updateItem("tiers", i, { level: v })} wide />
                    <TextAreaField label="Description" value={t.desc} onChange={(v) => updateItem("tiers", i, { desc: v })} />
                    <NumberField label="Cut price" value={t.cutPrice} onChange={(v) => updateItem("tiers", i, { cutPrice: v })} suffix="£" />
                    <NumberField label="Colour price" value={t.colourPrice} onChange={(v) => updateItem("tiers", i, { colourPrice: v })} suffix="£" />
                  </SectionCard>
                ))}
                <AddButton onClick={() => configStore.setContent({ tiers: [...cfg.tiers, { name: "New Tier", level: "Level", cutPrice: 85, colourPrice: 180, desc: "Description" }] })} label="Add tier" />

                <p className="font-mono mt-8 text-[9px] uppercase tracking-[0.22em] text-[#8f7d74]">Consultation quiz</p>
                {cfg.quizQuestions.map((q: QuizQuestion, i: number) => (
                  <SectionCard key={q.id} title={`Q${i + 1}`} accent="#e0b2b2" removable={cfg.quizQuestions.length > 1} onRemove={() => removeItem("quizQuestions", i)}>
                    <TextField label="Question" value={q.q} onChange={(v) => updateItem("quizQuestions", i, { q: v })} wide />
                    {q.options.map((opt, oi) => (
                      <div key={oi} className="rounded border border-[#f2e9e1]/8 bg-[#241c1d] p-2 mt-2">
                        <input value={opt.label} onChange={(e) => {
                          const newOpts = q.options.map((o, idx) => idx === oi ? { ...o, label: e.target.value } : o);
                          updateItem("quizQuestions", i, { options: newOpts } as any);
                        }} className="w-full rounded border border-[#f2e9e1]/10 bg-[#1c1516] px-2 py-1 text-[10px] text-[#f2e9e1]" />
                        <p className="font-mono text-[8px] text-[#8f7d74] mt-1">Scores (stylist_id: number)</p>
                        <input value={Object.entries(opt.score).map(([k, v]) => `${k}:${v}`).join(", ")} onChange={(e) => {
                          const score: Record<string, number> = {};
                          e.target.value.split(",").forEach((pair) => {
                            const [k, v] = pair.split(":").map((s) => s.trim());
                            if (k && v) score[k] = +v;
                          });
                          const newOpts = q.options.map((o, idx) => idx === oi ? { ...o, score } : o);
                          updateItem("quizQuestions", i, { options: newOpts } as any);
                        }} className="mt-1 w-full rounded border border-[#f2e9e1]/10 bg-[#1c1516] px-2 py-1 text-[10px] text-[#8f7d74]" />
                      </div>
                    ))}
                  </SectionCard>
                ))}
              </>
            )}
          </div>
        )}

        {tab === "mirror" && (
          <div className="mt-6">
            <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-[#8f7d74]">Muses (models)</p>
            {cfg.mirror.models.map((m, i) => (
              <div key={m.id} className="mt-3 rounded-[1rem_1rem_0.3rem_1rem] border border-[#f2e9e1]/10 bg-[#1c1516] p-4">
                <div className="flex items-center justify-between">
                  <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#d9c25a]">Muse {i + 1}</p>
                  <button onClick={() => configStore.setContent({ mirror: { ...cfg.mirror, models: cfg.mirror.models.filter((x) => x.id !== m.id) } })} data-cursor="hand" className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#c98d8d] hover:text-[#e3b6b6]">Remove</button>
                </div>
                <input value={m.label} placeholder="Label" onChange={(e) => configStore.setContent({ mirror: { ...cfg.mirror, models: cfg.mirror.models.map((x) => x.id === m.id ? { ...x, label: e.target.value } : x) } })} className="mt-2 w-full rounded-lg border border-[#f2e9e1]/15 bg-[#241c1d] px-3 py-1.5 text-[12px] text-[#f2e9e1]" />
                <input value={m.image} placeholder="Image URL" onChange={(e) => configStore.setContent({ mirror: { ...cfg.mirror, models: cfg.mirror.models.map((x) => x.id === m.id ? { ...x, image: e.target.value } : x) } })} className="mt-2 w-full rounded-lg border border-[#f2e9e1]/15 bg-[#241c1d] px-3 py-1.5 text-[12px] text-[#f2e9e1]" />
                <Row label="Base hair colour"><input type="color" value={m.hair} onChange={(e) => configStore.setContent({ mirror: { ...cfg.mirror, models: cfg.mirror.models.map((x) => x.id === m.id ? { ...x, hair: e.target.value } : x) } })} className="h-8 w-12 cursor-pointer rounded-lg border border-[#f2e9e1]/15 bg-transparent" /></Row>
              </div>
            ))}
            <button onClick={() => configStore.setContent({ mirror: { ...cfg.mirror, models: [...cfg.mirror.models, { id: `muse-${Date.now().toString(36)}`, label: "New Muse", image: "", hair: "#6b4f3a" }] } })} data-cursor="hand" className="mt-3 rounded-full border border-[#a8b5a0]/50 px-4 py-2 font-mono text-[9px] uppercase tracking-[0.18em] text-[#a8b5a0] hover:bg-[#a8b5a0]/10">+ Add muse</button>

            <p className="font-mono mt-8 text-[9px] uppercase tracking-[0.22em] text-[#8f7d74]">Shade library</p>
            {cfg.mirror.shades.map((s, i) => (
              <div key={s.id} className="mt-3 rounded-[1rem_1rem_0.3rem_1rem] border border-[#f2e9e1]/10 bg-[#1c1516] p-4">
                <div className="flex items-center justify-between">
                  <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#d9c25a]">{s.label}</p>
                  <button onClick={() => configStore.setContent({ mirror: { ...cfg.mirror, shades: cfg.mirror.shades.filter((x) => x.id !== s.id) } })} data-cursor="hand" className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#c98d8d] hover:text-[#e3b6b6]">Remove</button>
                </div>
                <input value={s.label} placeholder="Shade name" onChange={(e) => configStore.setContent({ mirror: { ...cfg.mirror, shades: cfg.mirror.shades.map((x) => x.id === s.id ? { ...x, label: e.target.value } : x) } })} className="mt-2 w-full rounded-lg border border-[#f2e9e1]/15 bg-[#241c1d] px-3 py-1.5 text-[12px] text-[#f2e9e1]" />
                <div className="mt-2 grid grid-cols-3 gap-3">
                  <label className="font-mono text-[8.5px] uppercase tracking-[0.14em] text-[#8f7d74]">Hue
                    <input type="range" min={0} max={360} value={s.h} onChange={(e) => configStore.setContent({ mirror: { ...cfg.mirror, shades: cfg.mirror.shades.map((x) => x.id === s.id ? { ...x, h: +e.target.value } : x) } })} className="range-luxe mt-1 w-full" /></label>
                  <label className="font-mono text-[8.5px] uppercase tracking-[0.14em] text-[#8f7d74]">Sat
                    <input type="range" min={0} max={100} value={s.s} onChange={(e) => configStore.setContent({ mirror: { ...cfg.mirror, shades: cfg.mirror.shades.map((x) => x.id === s.id ? { ...x, s: +e.target.value } : x) } })} className="range-luxe mt-1 w-full" /></label>
                  <label className="font-mono text-[8.5px] uppercase tracking-[0.14em] text-[#8f7d74]">Light
                    <input type="range" min={0} max={100} value={s.l} onChange={(e) => configStore.setContent({ mirror: { ...cfg.mirror, shades: cfg.mirror.shades.map((x) => x.id === s.id ? { ...x, l: +e.target.value } : x) } })} className="range-luxe mt-1 w-full" /></label>
                </div>
              </div>
            ))}
            <button onClick={() => configStore.setContent({ mirror: { ...cfg.mirror, shades: [...cfg.mirror.shades, { id: `shade-${Date.now().toString(36)}`, label: "New Shade", h: 30, s: 45, l: 55 }] } })} data-cursor="hand" className="mt-3 rounded-full border border-[#a8b5a0]/50 px-4 py-2 font-mono text-[9px] uppercase tracking-[0.18em] text-[#a8b5a0] hover:bg-[#a8b5a0]/10">+ Add shade</button>

            <p className="font-mono mt-8 text-[9px] uppercase tracking-[0.22em] text-[#8f7d74]">Engine</p>
            <SliderField label="Match range" value={cfg.mirror.tolerance} min={5} max={80} step={1} onChange={(v) => configStore.setContent({ mirror: { ...cfg.mirror, tolerance: v } })} />
            <ToggleField label="Protect skin tones" value={cfg.mirror.protectSkin} onChange={(v) => configStore.setContent({ mirror: { ...cfg.mirror, protectSkin: v } })} />
            <SliderField label="Default warmth" value={cfg.mirror.warmth} min={0} max={100} step={1} onChange={(v) => configStore.setContent({ mirror: { ...cfg.mirror, warmth: v } })} />
            <SliderField label="Default shine" value={cfg.mirror.shine} min={0} max={100} step={1} onChange={(v) => configStore.setContent({ mirror: { ...cfg.mirror, shine: v } })} />
          </div>
        )}

        {tab === "layout" && (
          <div className="mt-6">
            <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-[#8f7d74]">Sections — toggle & reorder</p>
            {cfg.slots.map((s: Slot, i: number) => (
              <div key={s.uid} className="mt-3 flex items-center justify-between rounded-[1rem_1rem_0.3rem_1rem] border border-[#f2e9e1]/10 bg-[#1c1516] p-4">
                <span className="font-display text-lg capitalize text-[#f2e9e1]">{s.id}</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => i > 0 && configStore.moveSlot(i, i - 1)} data-cursor="hand" aria-label="Move up" className="rounded-full border border-[#f2e9e1]/15 px-2.5 py-1 text-[#c0aea4] hover:text-[#f2e9e1] disabled:opacity-30" disabled={i === 0}>↑</button>
                  <button onClick={() => i < cfg.slots.length - 1 && configStore.moveSlot(i, i + 1)} data-cursor="hand" aria-label="Move down" className="rounded-full border border-[#f2e9e1]/15 px-2.5 py-1 text-[#c0aea4] hover:text-[#f2e9e1] disabled:opacity-30" disabled={i === cfg.slots.length - 1}>↓</button>
                  <ToggleField label="" value={s.enabled} onChange={() => configStore.toggleSlot(s.uid)} />
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "system" && (
          <div className="mt-6">
            <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-[#8f7d74]">Data</p>
            <button onClick={() => { configStore.resetAll(); toast("All settings reset to the demo defaults."); }} data-cursor="hand"
              className="mt-3 rounded-full border border-[#e3b6b6]/40 px-5 py-2.5 font-mono text-[9px] uppercase tracking-[0.16em] text-[#e3b6b6] hover:bg-[#e3b6b6]/10">Reset everything to demo defaults</button>
            <p className="mt-6 text-[12px] leading-relaxed text-[#8f7d74]">
              Settings persist in this browser (mirroring the WP <span className="font-mono text-[#d9c25a]">luxe_config</span> option in the theme).
              In WordPress the same panel is the Customizer, gated to authorized users only.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
