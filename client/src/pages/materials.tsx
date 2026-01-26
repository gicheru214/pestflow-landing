import { useState } from "react";
import { Link } from "wouter";
import { 
  ChevronLeft, 
  BarChart3, 
  Pencil, 
  Plus,
  Settings,
  Bell,
  MessageSquare,
  HelpCircle,
  Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import logoImage from "@assets/Screenshot_2026-01-13_at_7.27.30_PM-removebg-preview_1768354175011.png";

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

  const addMaterial = () => {
    if (newMaterial.name.trim()) {
      setMaterials([...materials, { id: Date.now(), ...newMaterial }]);
      setNewMaterial({ name: "", epa: "" });
    }
  };

  const addLocation = () => {
    if (newLocation.trim()) {
      setLocations([...locations, { id: Date.now(), name: newLocation }]);
      setNewLocation("");
    }
  };

  const addPest = () => {
    if (newPest.trim()) {
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
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="h-16 bg-white border-b flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <img src={logoImage} alt="PestFlow" className="h-8 w-auto object-contain" />
        </div>

        <div className="flex-1 max-w-xl mx-8 relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input placeholder="Search..." className="pl-10 bg-slate-50 border-slate-200 focus:bg-white transition-colors" />
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="text-slate-500">
            <Bell className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-slate-500">
            <MessageSquare className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-slate-500">
            <HelpCircle className="h-5 w-5" />
          </Button>
          <div className="h-6 w-px bg-slate-200 mx-1" />
          <Button variant="ghost" className="flex items-center gap-2 pl-1 pr-2">
            <Avatar className="h-8 w-8 border border-slate-200">
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium text-slate-700">Trevor</span>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Back Link */}
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-6 text-sm">
          <ChevronLeft className="h-4 w-4" />
          Addons
        </Link>

        {/* Material Usage Header */}
        <Card className="mb-8">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <CardTitle className="text-xl">Material Usage</CardTitle>
                <p className="text-sm text-slate-500 mt-1">
                  This is where you add a master list of all your materials, locations, target pests and methods.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">On</span>
              <Switch checked={isEnabled} onCheckedChange={setIsEnabled} />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="bg-emerald-500 hover:bg-emerald-600 text-white">
              Print Master Key
            </Button>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Checkbox 
                  id="showOnInvoices" 
                  checked={showOnInvoices} 
                  onCheckedChange={(checked) => setShowOnInvoices(checked as boolean)} 
                />
                <label htmlFor="showOnInvoices" className="text-sm text-slate-600 cursor-pointer">
                  Display the entire material list on all invoices and work orders
                </label>
              </div>
              <div className="flex items-center gap-3">
                <Checkbox 
                  id="hideMaterials" 
                  checked={hideMaterials} 
                  onCheckedChange={(checked) => setHideMaterials(checked as boolean)} 
                />
                <label htmlFor="hideMaterials" className="text-sm text-slate-600 cursor-pointer">
                  Hide materials used on invoices
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Three Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Materials Column */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-lg font-semibold text-slate-800">Materials</CardTitle>
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-slate-400 hover:text-slate-600"
                  onClick={() => setEditingMaterials(!editingMaterials)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {materials.map((material, index) => (
                <div key={material.id} className="flex items-start justify-between group">
                  <div>
                    <p className="text-sm text-slate-700">
                      <span className="text-slate-400 mr-1">{index + 1}.</span>
                      {material.name}
                    </p>
                    <p className="text-xs text-slate-400 ml-4">EPA# {material.epa}</p>
                  </div>
                  {editingMaterials && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100"
                      onClick={() => removeMaterial(material.id)}
                    >
                      ×
                    </Button>
                  )}
                </div>
              ))}
              
              {editingMaterials && (
                <div className="pt-3 border-t space-y-2">
                  <Input 
                    placeholder="Material name" 
                    value={newMaterial.name}
                    onChange={(e) => setNewMaterial({ ...newMaterial, name: e.target.value })}
                    className="h-8 text-sm"
                  />
                  <Input 
                    placeholder="EPA#" 
                    value={newMaterial.epa}
                    onChange={(e) => setNewMaterial({ ...newMaterial, epa: e.target.value })}
                    className="h-8 text-sm"
                  />
                  <Button size="sm" onClick={addMaterial} className="w-full">
                    <Plus className="h-4 w-4 mr-1" /> Add Material
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Locations Column */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-lg font-semibold text-slate-800">Locations</CardTitle>
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-slate-400 hover:text-slate-600"
                  onClick={() => setEditingLocations(!editingLocations)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Switch defaultChecked />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {locations.map((location, index) => (
                <div key={location.id} className="flex items-center justify-between group">
                  <p className="text-sm text-slate-700">
                    <span className="text-slate-400 mr-1">{index + 1}.</span>
                    {location.name}
                  </p>
                  {editingLocations && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100"
                      onClick={() => removeLocation(location.id)}
                    >
                      ×
                    </Button>
                  )}
                </div>
              ))}
              
              {editingLocations && (
                <div className="pt-3 border-t space-y-2">
                  <Input 
                    placeholder="Location name" 
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="h-8 text-sm"
                  />
                  <Button size="sm" onClick={addLocation} className="w-full">
                    <Plus className="h-4 w-4 mr-1" /> Add Location
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Target Pests Column */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-lg font-semibold text-slate-800">Target Pests</CardTitle>
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-slate-400 hover:text-slate-600"
                  onClick={() => setEditingPests(!editingPests)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Switch defaultChecked />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {pests.map((pest, index) => (
                <div key={pest.id} className="flex items-center justify-between group">
                  <p className="text-sm text-slate-700">
                    <span className="text-slate-400 mr-1">{index + 1}.</span>
                    {pest.name}
                  </p>
                  {editingPests && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100"
                      onClick={() => removePest(pest.id)}
                    >
                      ×
                    </Button>
                  )}
                </div>
              ))}
              
              <button 
                onClick={() => setEditingPests(true)}
                className="flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700 pt-2"
              >
                <Plus className="h-4 w-4" /> Add New
              </button>
              
              {editingPests && (
                <div className="pt-3 border-t space-y-2">
                  <Input 
                    placeholder="Pest name" 
                    value={newPest}
                    onChange={(e) => setNewPest(e.target.value)}
                    className="h-8 text-sm"
                  />
                  <Button size="sm" onClick={addPest} className="w-full">
                    <Plus className="h-4 w-4 mr-1" /> Add Pest
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
