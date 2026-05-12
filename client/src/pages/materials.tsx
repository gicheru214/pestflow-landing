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
  X,
  Check,
  Printer,
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

  const removeMaterial = (id: number) => setMaterials(materials.filter(m => m.id !== id));
  const removeLocation = (id: number) => setLocations(locations.filter(l => l.id !== id));
  const removePest = (id: number) => setPests(pests.filter(p => p.id !== id));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <img src={logoImage} alt="PestFlow" className="h-10 w-auto object-contain" />
        </div>
        <div className="flex-1 max-w-xl mx-8 relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search..."
            className="pl-10 bg-gray-50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-emerald-100 focus:border-emerald-400 transition-all rounded-lg h-9 text-sm"
            onFocus={() => analytics.track(EVENTS.NAVIGATION.SEARCH_FOCUS)}
            onChange={(e) => { if (e.target.value.length > 2) analytics.track(EVENTS.MATERIALS.SEARCH); }}
          />
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-600 rounded-lg" onClick={() => analytics.track(EVENTS.NAVIGATION.NOTIFICATIONS_OPEN)}>
            <Bell className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-600 rounded-lg" onClick={() => analytics.track(EVENTS.NAVIGATION.MENU_OPEN, { menu: 'messages' })}>
            <MessageSquare className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-600 rounded-lg" onClick={() => analytics.track(EVENTS.NAVIGATION.HELP_CLICK)}>
            <HelpCircle className="h-5 w-5" />
          </Button>
          <div className="h-6 w-px bg-gray-200 mx-2" />
          <Button variant="ghost" className="flex items-center gap-2 pl-2 pr-3 rounded-lg hover:bg-gray-50" onClick={() => analytics.track(EVENTS.NAVIGATION.PROFILE_CLICK)}>
            <Avatar className="h-8 w-8 ring-2 ring-emerald-100">
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback className="bg-emerald-50 text-emerald-700 text-xs font-semibold">JD</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium text-gray-700">Trevor</span>
          </Button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Back link */}
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-gray-400 hover:text-gray-600 mb-6 text-sm transition-colors">
          <ChevronLeft className="h-4 w-4" />
          Addons
        </Link>

        {/* Hero card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm mb-6 overflow-hidden">
          {/* Top accent strip */}
          <div className="h-1 w-full bg-gradient-to-r from-emerald-400 to-emerald-500" />
          <div className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-5">
                <div className="h-14 w-14 bg-emerald-50 rounded-xl flex items-center justify-center border border-emerald-100 flex-shrink-0">
                  <BarChart3 className="h-7 w-7 text-emerald-500" />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h1 className="text-xl font-semibold text-gray-900">Material Usage</h1>
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                      EPA Tracking
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 max-w-xl leading-relaxed">
                    Add a master list of all your materials, locations, target pests and methods. Tracked per job and printed on invoices automatically.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0 ml-6">
                <span className="text-sm text-gray-500">{isEnabled ? "On" : "Off"}</span>
                <Switch checked={isEnabled} onCheckedChange={setIsEnabled} className="data-[state=checked]:bg-emerald-500" />
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100 mt-5 pt-5 flex flex-wrap items-center gap-6">
              <Button className="gap-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg shadow-sm">
                <Printer className="h-4 w-4" />
                Print Master Key
              </Button>

              <label className="flex items-start gap-2.5 cursor-pointer group">
                <Checkbox
                  id="showOnInvoices"
                  checked={showOnInvoices}
                  onCheckedChange={(c) => setShowOnInvoices(c as boolean)}
                  className="mt-0.5 rounded border-gray-300 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                />
                <div>
                  <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors leading-tight">Show on invoices</p>
                  <p className="text-xs text-gray-400 mt-0.5">Display full material list on work orders</p>
                </div>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer group">
                <Checkbox
                  id="hideMaterials"
                  checked={hideMaterials}
                  onCheckedChange={(c) => setHideMaterials(c as boolean)}
                  className="mt-0.5 rounded border-gray-300 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                />
                <div>
                  <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors leading-tight">Hide materials</p>
                  <p className="text-xs text-gray-400 mt-0.5">Suppress from client-facing docs</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Three columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

          {/* Materials */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-800">Materials</h2>
              <button
                onClick={() => setEditingMaterials(!editingMaterials)}
                className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-all ${
                  editingMaterials
                    ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                    : "text-gray-400 border-transparent hover:text-gray-600 hover:bg-gray-50"
                }`}
              >
                {editingMaterials ? <><Check className="h-3.5 w-3.5" /> Done</> : <><Pencil className="h-3.5 w-3.5" /> Edit</>}
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-2 py-2 max-h-[420px]">
              {materials.map((material, index) => (
                <div
                  key={material.id}
                  className="group flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs text-gray-300 font-mono w-5 text-right flex-shrink-0">{index + 1}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-700 truncate">{material.name}</p>
                      <p className="text-xs text-emerald-500 font-mono mt-0.5">EPA# {material.epa}</p>
                    </div>
                  </div>
                  {editingMaterials && (
                    <button
                      onClick={() => removeMaterial(material.id)}
                      className="opacity-0 group-hover:opacity-100 ml-2 h-6 w-6 flex items-center justify-center rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 transition-all flex-shrink-0"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {editingMaterials ? (
              <div className="px-4 py-4 border-t border-gray-100 bg-gray-50 space-y-2">
                <Input placeholder="Material name" value={newMaterial.name} onChange={(e) => setNewMaterial({ ...newMaterial, name: e.target.value })} className="h-8 text-sm rounded-lg border-gray-200 bg-white focus:border-emerald-400" />
                <Input placeholder="EPA registration #" value={newMaterial.epa} onChange={(e) => setNewMaterial({ ...newMaterial, epa: e.target.value })} className="h-8 text-sm rounded-lg border-gray-200 bg-white focus:border-emerald-400" />
                <Button size="sm" onClick={addMaterial} className="w-full h-8 text-xs font-semibold rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white">
                  <Plus className="h-3.5 w-3.5 mr-1" /> Add Material
                </Button>
              </div>
            ) : (
              <div className="px-4 py-3 border-t border-gray-100">
                <button onClick={() => setEditingMaterials(true)} className="w-full flex items-center justify-center gap-1.5 text-xs text-gray-400 hover:text-emerald-600 py-1 transition-colors">
                  <Plus className="h-3.5 w-3.5" /> Add material
                </button>
              </div>
            )}
          </div>

          {/* Locations */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-800">Locations</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditingLocations(!editingLocations)}
                  className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-all ${
                    editingLocations
                      ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                      : "text-gray-400 border-transparent hover:text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {editingLocations ? <><Check className="h-3.5 w-3.5" /> Done</> : <><Pencil className="h-3.5 w-3.5" /> Edit</>}
                </button>
                <Switch defaultChecked className="data-[state=checked]:bg-emerald-500 scale-90" />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-2 py-2 max-h-[420px]">
              {locations.map((location, index) => (
                <div key={location.id} className="group flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-300 font-mono w-5 text-right">{index + 1}</span>
                    <p className="text-sm text-gray-700">{location.name}</p>
                  </div>
                  {editingLocations && (
                    <button onClick={() => removeLocation(location.id)} className="opacity-0 group-hover:opacity-100 ml-2 h-6 w-6 flex items-center justify-center rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 transition-all flex-shrink-0">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {editingLocations ? (
              <div className="px-4 py-4 border-t border-gray-100 bg-gray-50 space-y-2">
                <Input placeholder="Location name" value={newLocation} onChange={(e) => setNewLocation(e.target.value)} className="h-8 text-sm rounded-lg border-gray-200 bg-white focus:border-emerald-400" />
                <Button size="sm" onClick={addLocation} className="w-full h-8 text-xs font-semibold rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white">
                  <Plus className="h-3.5 w-3.5 mr-1" /> Add Location
                </Button>
              </div>
            ) : (
              <div className="px-4 py-3 border-t border-gray-100">
                <button onClick={() => setEditingLocations(true)} className="w-full flex items-center justify-center gap-1.5 text-xs text-gray-400 hover:text-emerald-600 py-1 transition-colors">
                  <Plus className="h-3.5 w-3.5" /> Add location
                </button>
              </div>
            )}
          </div>

          {/* Target Pests */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-800">Target Pests</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditingPests(!editingPests)}
                  className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-all ${
                    editingPests
                      ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                      : "text-gray-400 border-transparent hover:text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {editingPests ? <><Check className="h-3.5 w-3.5" /> Done</> : <><Pencil className="h-3.5 w-3.5" /> Edit</>}
                </button>
                <Switch defaultChecked className="data-[state=checked]:bg-emerald-500 scale-90" />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-2 py-2 max-h-[420px]">
              {pests.map((pest, index) => (
                <div key={pest.id} className="group flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-300 font-mono w-5 text-right">{index + 1}</span>
                    <p className="text-sm text-gray-700">{pest.name}</p>
                  </div>
                  {editingPests && (
                    <button onClick={() => removePest(pest.id)} className="opacity-0 group-hover:opacity-100 ml-2 h-6 w-6 flex items-center justify-center rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 transition-all flex-shrink-0">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {editingPests ? (
              <div className="px-4 py-4 border-t border-gray-100 bg-gray-50 space-y-2">
                <Input placeholder="Pest name" value={newPest} onChange={(e) => setNewPest(e.target.value)} className="h-8 text-sm rounded-lg border-gray-200 bg-white focus:border-emerald-400" />
                <Button size="sm" onClick={addPest} className="w-full h-8 text-xs font-semibold rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white">
                  <Plus className="h-3.5 w-3.5 mr-1" /> Add Pest
                </Button>
              </div>
            ) : (
              <div className="px-4 py-3 border-t border-gray-100">
                <button onClick={() => setEditingPests(true)} className="w-full flex items-center justify-center gap-1.5 text-xs text-gray-400 hover:text-emerald-600 py-1 transition-colors">
                  <Plus className="h-3.5 w-3.5" /> Add pest
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
