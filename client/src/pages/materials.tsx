import { useState, useEffect } from "react";
import { Link } from "wouter";
import {
  ChevronLeft,
  BarChart3,
  Pencil,
  Plus,
  Bell,
  MessageSquare,
  HelpCircle,
  Search,
  ShieldCheck,
  FileText,
  MapPin,
  Bug,
  Printer,
  X,
  Check,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import logoImage from "@assets/CF59A14F-4807-4B1E-88AE-7ECF96E43F4F_1776102133381.PNG";
import { analytics, EVENTS } from "@/lib/analytics";

const INITIAL_MATERIALS = [
  { id: 1, name: "Cyper TC .25%", epa: "53883-92" },
  { id: 2, name: "Suspend SC .03%", epa: "432763" },
  { id: 3, name: "Termidor SC .06%", epa: "7969-210" },
  { id: 4, name: "Cyzmic CS .06%", epa: "53883-261" },
  { id: 5, name: "Orthen Crystals 1%", epa: "54818973" },
  { id: 6, name: "Gentrol IGR", epa: "2724-351" },
  { id: 7, name: "Tarro PCO 5.4%", epa: "149864405" },
  { id: 8, name: "Maxforce Gel .05%", epa: "432-1490" },
  { id: 9, name: "Maxforce Complete 1%", epa: "432-1259" },
];

const INITIAL_LOCATIONS = [
  { id: 1, name: "Exterior Foundation" },
  { id: 2, name: "Interior Baseboards" },
  { id: 3, name: "Garage" },
  { id: 4, name: "Kitchen" },
  { id: 5, name: "Bathroom(s)" },
  { id: 6, name: "Shed(s)" },
  { id: 7, name: "Office Interior" },
  { id: 8, name: "Bar" },
  { id: 9, name: "Dinning Area" },
  { id: 10, name: "Kitchen equipment - ..." },
  { id: 11, name: "Utility or Storage Closet" },
  { id: 12, name: "Dumpster Area" },
  { id: 13, name: "Wall Voids" },
];

const INITIAL_PESTS = [
  { id: 1, name: "General Maintenance" },
  { id: 2, name: "Roaches" },
  { id: 3, name: "Spiders" },
  { id: 4, name: "Ants" },
  { id: 5, name: "Scorpions" },
  { id: 6, name: "Crickets" },
  { id: 7, name: "Roof Rats" },
  { id: 8, name: "Field Mice" },
  { id: 9, name: "Bees" },
];

export default function Materials() {
  const [isEnabled, setIsEnabled] = useState(true);
  const [showOnInvoices, setShowOnInvoices] = useState(false);
  const [hideMaterials, setHideMaterials] = useState(false);
  const [materials, setMaterials] = useState(INITIAL_MATERIALS);
  const [locations, setLocations] = useState(INITIAL_LOCATIONS);
  const [pests, setPests] = useState(INITIAL_PESTS);
  const [editingMaterials, setEditingMaterials] = useState(false);
  const [editingLocations, setEditingLocations] = useState(false);
  const [editingPests, setEditingPests] = useState(false);
  const [newMaterial, setNewMaterial] = useState({ name: "", epa: "" });
  const [newLocation, setNewLocation] = useState("");
  const [newPest, setNewPest] = useState("");

  useEffect(() => {
    analytics.track(EVENTS.DASHBOARD.MATERIALS_VIEW);
    analytics.track(EVENTS.MATERIALS.LIST_VIEW);
  }, []);

  const addMaterial = () => {
    if (newMaterial.name.trim()) {
      analytics.track(EVENTS.MATERIALS.ADD_COMPLETE, { type: 'material' });
      setMaterials([...materials, { id: Date.now(), ...newMaterial }]);
      setNewMaterial({ name: "", epa: "" });
    }
  };

  const addLocation = () => {
    if (newLocation.trim()) {
      analytics.track(EVENTS.MATERIALS.ADD_COMPLETE, { type: 'location' });
      setLocations([...locations, { id: Date.now(), name: newLocation }]);
      setNewLocation("");
    }
  };

  const addPest = () => {
    if (newPest.trim()) {
      analytics.track(EVENTS.MATERIALS.ADD_COMPLETE, { type: 'pest' });
      setPests([...pests, { id: Date.now(), name: newPest }]);
      setNewPest("");
    }
  };

  const removeMaterial = (id: number) => {
    setMaterials(materials.filter(m => m.id !== id));
  };

  const removeLocation = (id: number) => {
    setLocations(locations.filter(l => l.id !== id));
  };

  const removePest = (id: number) => {
    setPests(pests.filter(p => p.id !== id));
  };

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(135deg, #f0fffe 0%, #f8fafc 50%, #f0f9ff 100%)" }}>
      {/* Header */}
      <header className="h-16 bg-white/80 backdrop-blur border-b border-slate-100 flex items-center justify-between px-6 sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <img src={logoImage} alt="PestFlow" className="h-10 w-auto object-contain" />
        </div>

        <div className="flex-1 max-w-xl mx-8 relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search materials, locations, pests…"
            className="pl-10 bg-slate-50 border-slate-200 focus:bg-white focus:border-cyan-300 focus:ring-cyan-100 transition-all rounded-xl h-9 text-sm"
            onFocus={() => analytics.track(EVENTS.NAVIGATION.SEARCH_FOCUS)}
            onChange={(e) => {
              if (e.target.value.length > 2) {
                analytics.track(EVENTS.MATERIALS.SEARCH);
              }
            }}
          />
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl"
            onClick={() => analytics.track(EVENTS.NAVIGATION.NOTIFICATIONS_OPEN)}
          >
            <Bell className="h-4.5 w-4.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl"
            onClick={() => analytics.track(EVENTS.NAVIGATION.MENU_OPEN, { menu: 'messages' })}
          >
            <MessageSquare className="h-4.5 w-4.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl"
            onClick={() => analytics.track(EVENTS.NAVIGATION.HELP_CLICK)}
          >
            <HelpCircle className="h-4.5 w-4.5" />
          </Button>
          <div className="h-6 w-px bg-slate-100 mx-2" />
          <Button
            variant="ghost"
            className="flex items-center gap-2 pl-2 pr-3 rounded-xl hover:bg-slate-50"
            onClick={() => analytics.track(EVENTS.NAVIGATION.PROFILE_CLICK)}
          >
            <Avatar className="h-7 w-7 ring-2 ring-cyan-100">
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback className="bg-cyan-50 text-cyan-700 text-xs font-semibold">JD</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium text-slate-700">Trevor</span>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm mb-7 text-slate-400">
          <Link href="/dashboard" className="hover:text-slate-600 transition-colors">Dashboard</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-slate-500 font-medium">Compliance & Materials</span>
        </nav>

        {/* Hero Header Card */}
        <div
          className="rounded-2xl p-6 mb-6 relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #e0fdfb 0%, #f0fdfc 40%, #ecfeff 100%)",
            border: "1px solid #a5f3f0",
          }}
        >
          {/* Decorative blob */}
          <div
            className="absolute right-0 top-0 h-full w-64 opacity-30 pointer-events-none"
            style={{
              background: "radial-gradient(ellipse at right top, #1ECFC8 0%, transparent 70%)",
            }}
          />

          <div className="relative flex items-start justify-between">
            <div className="flex items-center gap-5">
              <div
                className="h-14 w-14 rounded-2xl flex items-center justify-center shadow-sm flex-shrink-0"
                style={{ background: "linear-gradient(135deg, #1ECFC8, #0fb3ac)" }}
              >
                <ShieldCheck className="h-7 w-7 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-xl font-semibold text-slate-800">Material Usage & Compliance</h1>
                  <span
                    className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
                    style={{ background: "#d1faf8", color: "#0d9488" }}
                  >
                    EPA Compliant
                  </span>
                </div>
                <p className="text-sm text-slate-500 max-w-xl">
                  Maintain your master list of pesticides with EPA registration numbers, treatment locations, and target pests — auto-printed on invoices and work orders.
                </p>
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    {materials.length} materials tracked
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <div className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                    {locations.length} locations configured
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <div className="h-1.5 w-1.5 rounded-full bg-violet-400" />
                    {pests.length} pest types
                  </div>
                </div>
              </div>
            </div>

            {/* Enable toggle */}
            <div className="flex items-center gap-3 flex-shrink-0 ml-6">
              <div className="text-right">
                <p className="text-xs font-medium text-slate-600 mb-0.5">Module Status</p>
                <p className="text-xs text-slate-400">{isEnabled ? "Active" : "Disabled"}</p>
              </div>
              <Switch
                checked={isEnabled}
                onCheckedChange={setIsEnabled}
                className="data-[state=checked]:bg-cyan-500"
              />
            </div>
          </div>

          {/* Controls row */}
          <div className="relative flex items-center gap-4 mt-5 pt-5 border-t border-cyan-100/60">
            <Button
              className="gap-2 text-sm font-medium rounded-xl shadow-sm"
              style={{ background: "linear-gradient(135deg, #1ECFC8, #0fb3ac)", color: "white" }}
            >
              <Printer className="h-4 w-4" />
              Print Master Key
            </Button>

            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <Checkbox
                  id="showOnInvoices"
                  checked={showOnInvoices}
                  onCheckedChange={(checked) => setShowOnInvoices(checked as boolean)}
                  className="rounded-md border-slate-300 data-[state=checked]:bg-cyan-500 data-[state=checked]:border-cyan-500"
                />
                <div>
                  <p className="text-sm font-medium text-slate-700 group-hover:text-slate-900 transition-colors">Show on invoices</p>
                  <p className="text-xs text-slate-400">Print full list on work orders</p>
                </div>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer group">
                <Checkbox
                  id="hideMaterials"
                  checked={hideMaterials}
                  onCheckedChange={(checked) => setHideMaterials(checked as boolean)}
                  className="rounded-md border-slate-300 data-[state=checked]:bg-cyan-500 data-[state=checked]:border-cyan-500"
                />
                <div>
                  <p className="text-sm font-medium text-slate-700 group-hover:text-slate-900 transition-colors">Hide from clients</p>
                  <p className="text-xs text-slate-400">Suppress on client-facing docs</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Three Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

          {/* Materials Column */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <BarChart3 className="h-4 w-4 text-emerald-500" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-slate-800">Materials</h2>
                  <p className="text-xs text-slate-400">{materials.length} products</p>
                </div>
              </div>
              <button
                onClick={() => setEditingMaterials(!editingMaterials)}
                className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${
                  editingMaterials
                    ? "bg-emerald-50 text-emerald-600"
                    : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                }`}
              >
                {editingMaterials ? <Check className="h-3.5 w-3.5" /> : <Pencil className="h-3.5 w-3.5" />}
                {editingMaterials ? "Done" : "Edit"}
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-3 space-y-1.5 max-h-96">
              {materials.map((material, index) => (
                <div
                  key={material.id}
                  className="group flex items-center justify-between py-2 px-3 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs font-mono text-slate-300 w-5 text-right flex-shrink-0">{index + 1}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-700 truncate">{material.name}</p>
                      <span
                        className="inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-md font-mono mt-0.5"
                        style={{ background: "#f0fdf4", color: "#16a34a" }}
                      >
                        EPA {material.epa}
                      </span>
                    </div>
                  </div>
                  {editingMaterials && (
                    <button
                      onClick={() => removeMaterial(material.id)}
                      className="ml-2 h-6 w-6 flex items-center justify-center rounded-lg text-slate-300 hover:text-red-400 hover:bg-red-50 transition-all flex-shrink-0 opacity-0 group-hover:opacity-100"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {editingMaterials && (
              <div className="px-5 py-4 border-t border-slate-100 bg-slate-50/50 space-y-2">
                <Input
                  placeholder="Material name"
                  value={newMaterial.name}
                  onChange={(e) => setNewMaterial({ ...newMaterial, name: e.target.value })}
                  className="h-8 text-sm rounded-lg border-slate-200 bg-white focus:border-cyan-300"
                />
                <Input
                  placeholder="EPA registration #"
                  value={newMaterial.epa}
                  onChange={(e) => setNewMaterial({ ...newMaterial, epa: e.target.value })}
                  className="h-8 text-sm rounded-lg border-slate-200 bg-white focus:border-cyan-300"
                />
                <Button
                  size="sm"
                  onClick={addMaterial}
                  className="w-full h-8 text-xs font-semibold rounded-lg"
                  style={{ background: "#1ECFC8", color: "white" }}
                >
                  <Plus className="h-3.5 w-3.5 mr-1" /> Add Material
                </Button>
              </div>
            )}

            {!editingMaterials && (
              <div className="px-5 py-3 border-t border-slate-50">
                <button
                  onClick={() => setEditingMaterials(true)}
                  className="w-full flex items-center justify-center gap-1.5 text-xs text-slate-400 hover:text-cyan-600 transition-colors py-1"
                >
                  <Plus className="h-3.5 w-3.5" /> Add material
                </button>
              </div>
            )}
          </div>

          {/* Locations Column */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-xl bg-cyan-50 flex items-center justify-center">
                  <MapPin className="h-4 w-4 text-cyan-500" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-slate-800">Locations</h2>
                  <p className="text-xs text-slate-400">{locations.length} areas</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditingLocations(!editingLocations)}
                  className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${
                    editingLocations
                      ? "bg-cyan-50 text-cyan-600"
                      : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {editingLocations ? <Check className="h-3.5 w-3.5" /> : <Pencil className="h-3.5 w-3.5" />}
                  {editingLocations ? "Done" : "Edit"}
                </button>
                <Switch defaultChecked className="data-[state=checked]:bg-cyan-500 scale-90" />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-3 space-y-1 max-h-96">
              {locations.map((location, index) => (
                <div
                  key={location.id}
                  className="group flex items-center justify-between py-2 px-3 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-slate-300 w-5 text-right">{index + 1}</span>
                    <p className="text-sm text-slate-700">{location.name}</p>
                  </div>
                  {editingLocations && (
                    <button
                      onClick={() => removeLocation(location.id)}
                      className="ml-2 h-6 w-6 flex items-center justify-center rounded-lg text-slate-300 hover:text-red-400 hover:bg-red-50 transition-all flex-shrink-0 opacity-0 group-hover:opacity-100"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {editingLocations && (
              <div className="px-5 py-4 border-t border-slate-100 bg-slate-50/50 space-y-2">
                <Input
                  placeholder="Location name"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="h-8 text-sm rounded-lg border-slate-200 bg-white focus:border-cyan-300"
                />
                <Button
                  size="sm"
                  onClick={addLocation}
                  className="w-full h-8 text-xs font-semibold rounded-lg"
                  style={{ background: "#1ECFC8", color: "white" }}
                >
                  <Plus className="h-3.5 w-3.5 mr-1" /> Add Location
                </Button>
              </div>
            )}

            {!editingLocations && (
              <div className="px-5 py-3 border-t border-slate-50">
                <button
                  onClick={() => setEditingLocations(true)}
                  className="w-full flex items-center justify-center gap-1.5 text-xs text-slate-400 hover:text-cyan-600 transition-colors py-1"
                >
                  <Plus className="h-3.5 w-3.5" /> Add location
                </button>
              </div>
            )}
          </div>

          {/* Target Pests Column */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-xl bg-violet-50 flex items-center justify-center">
                  <Bug className="h-4 w-4 text-violet-500" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-slate-800">Target Pests</h2>
                  <p className="text-xs text-slate-400">{pests.length} types</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditingPests(!editingPests)}
                  className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${
                    editingPests
                      ? "bg-violet-50 text-violet-600"
                      : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {editingPests ? <Check className="h-3.5 w-3.5" /> : <Pencil className="h-3.5 w-3.5" />}
                  {editingPests ? "Done" : "Edit"}
                </button>
                <Switch defaultChecked className="data-[state=checked]:bg-cyan-500 scale-90" />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-3 space-y-1 max-h-96">
              {pests.map((pest, index) => (
                <div
                  key={pest.id}
                  className="group flex items-center justify-between py-2 px-3 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-slate-300 w-5 text-right">{index + 1}</span>
                    <p className="text-sm text-slate-700">{pest.name}</p>
                  </div>
                  {editingPests && (
                    <button
                      onClick={() => removePest(pest.id)}
                      className="ml-2 h-6 w-6 flex items-center justify-center rounded-lg text-slate-300 hover:text-red-400 hover:bg-red-50 transition-all flex-shrink-0 opacity-0 group-hover:opacity-100"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {editingPests && (
              <div className="px-5 py-4 border-t border-slate-100 bg-slate-50/50 space-y-2">
                <Input
                  placeholder="Pest name"
                  value={newPest}
                  onChange={(e) => setNewPest(e.target.value)}
                  className="h-8 text-sm rounded-lg border-slate-200 bg-white focus:border-cyan-300"
                />
                <Button
                  size="sm"
                  onClick={addPest}
                  className="w-full h-8 text-xs font-semibold rounded-lg"
                  style={{ background: "#1ECFC8", color: "white" }}
                >
                  <Plus className="h-3.5 w-3.5 mr-1" /> Add Pest
                </Button>
              </div>
            )}

            {!editingPests && (
              <div className="px-5 py-3 border-t border-slate-50">
                <button
                  onClick={() => setEditingPests(true)}
                  className="w-full flex items-center justify-center gap-1.5 text-xs text-slate-400 hover:text-cyan-600 transition-colors py-1"
                >
                  <Plus className="h-3.5 w-3.5" /> Add pest
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Bottom trust bar */}
        <div className="mt-6 flex items-center justify-center gap-8 py-4">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            EPA registration tracking
          </div>
          <div className="h-3 w-px bg-slate-200" />
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <FileText className="h-3.5 w-3.5 text-cyan-400" />
            Auto-generates on invoices
          </div>
          <div className="h-3 w-px bg-slate-200" />
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Printer className="h-3.5 w-3.5 text-violet-400" />
            Printable master key
          </div>
        </div>
      </div>
    </div>
  );
}
