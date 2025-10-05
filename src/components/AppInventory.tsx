import { useState } from 'react';
import { Application } from '../types';
import Papa from 'papaparse';
import { Upload, Plus, Trash2, Package, Grid } from 'lucide-react';

interface AppInventoryProps {
  applications: Application[];
  onAddApplication: (app: Omit<Application, 'id' | 'addedDate'>) => void;
  onRemoveApplication: (id: string) => void;
  onImportApps: (apps: Application[]) => void;
}

export const AppInventory: React.FC<AppInventoryProps> = ({
  applications,
  onAddApplication,
  onRemoveApplication,
  onImportApps
}) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    vendor: '',
    version: '',
    category: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.vendor) {
      onAddApplication(formData);
      setFormData({ name: '', vendor: '', version: '', category: '' });
      setShowForm(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        complete: (results) => {
          const apps: Application[] = results.data
            .filter((row: unknown) => {
              const r = row as Record<string, string>;
              return r.name && r.vendor;
            })
            .map((row: unknown, index: number) => {
              const r = row as Record<string, string>;
              return {
                id: `app-${Date.now()}-${index}`,
                name: r.name,
                vendor: r.vendor,
                version: r.version || undefined,
                category: r.category || undefined,
                addedDate: new Date().toISOString()
              };
            });
          onImportApps(apps);
        },
        error: (error) => {
          console.error('Error parsing CSV:', error);
          alert('Error parsing CSV file. Please check the format.');
        }
      });
    }
  };

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header with Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-12">
          <div>
            <h1 className="text-5xl font-bold text-white mb-3 tracking-tight">
              Application Inventory
            </h1>
            <p className="text-slate-400 font-light">
              Track and monitor your software stack
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowForm(!showForm)}
              className="group bg-blue-500/10 border border-blue-500/30 hover:bg-blue-500/20 hover:border-blue-400/50 text-blue-300 px-6 py-3 rounded-xl flex items-center gap-2 transition-all duration-200 hover:scale-105 font-medium"
            >
              <Plus size={18} />
              Add App
            </button>
            <label className="cursor-pointer group bg-green-500/10 border border-green-500/30 hover:bg-green-500/20 hover:border-green-400/50 text-green-300 px-6 py-3 rounded-xl flex items-center gap-2 transition-all duration-200 hover:scale-105">
              <Upload size={18} />
              <span className="font-medium">Import CSV</span>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Add Form */}
        {showForm && (
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 mb-8 animate-in fade-in duration-300">
            <h3 className="text-xl font-semibold text-white mb-6 tracking-tight">Add New Application</h3>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    App Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                    placeholder="e.g. Slack"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Vendor <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.vendor}
                    onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                    placeholder="e.g. Slack Technologies"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Version
                  </label>
                  <input
                    type="text"
                    value={formData.version}
                    onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                    placeholder="e.g. 4.35.0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Category
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                    placeholder="e.g. Communication"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="bg-blue-500/20 border border-blue-500/30 hover:bg-blue-500/30 hover:border-blue-400/50 text-blue-300 px-6 py-3 rounded-lg transition-all duration-200 font-medium hover:scale-105"
                >
                  Add Application
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-slate-300 px-6 py-3 rounded-lg transition-all duration-200 font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Applications Grid */}
        {applications.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center mx-auto mb-6">
              <Package size={32} className="text-blue-400" />
            </div>
            <h3 className="text-2xl font-semibold text-white mb-2">No Applications Yet</h3>
            <p className="text-slate-400 font-light mb-6">Start by adding your first application to track vulnerabilities</p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setShowForm(true)}
                className="bg-blue-500/20 border border-blue-500/30 hover:bg-blue-500/30 text-blue-300 px-6 py-3 rounded-lg transition-all duration-200 font-medium hover:scale-105"
              >
                Add Manually
              </button>
              <label className="cursor-pointer bg-green-500/20 border border-green-500/30 hover:bg-green-500/30 text-green-300 px-6 py-3 rounded-lg transition-all duration-200 font-medium hover:scale-105">
                Import CSV
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        ) : (
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
            {/* Table Header */}
            <div className="bg-white/5 border-b border-white/10 px-6 py-4">
              <div className="flex items-center gap-2 text-slate-400">
                <Grid size={18} />
                <span className="font-semibold">{applications.length} Applications</span>
              </div>
            </div>
            
            {/* Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-white/5 border-b border-white/10">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Application
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Vendor
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Version
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {applications.map((app) => (
                    <tr key={app.id} className="group hover:bg-white/5 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                            <Package size={16} className="text-blue-400" />
                          </div>
                          <span className="font-semibold text-white">{app.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-300 font-light">
                        {app.vendor}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 bg-white/5 border border-white/10 text-slate-300 rounded-lg text-sm">
                          {app.version || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-300 font-light">
                        {app.category || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => onRemoveApplication(app.id)}
                          className="p-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/20 hover:scale-110 transition-all duration-200"
                          title="Remove application"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* CSV Format Help Card */}
        <div className="bg-blue-500/10 backdrop-blur-sm border border-blue-500/20 rounded-xl p-8">
          <h3 className="text-lg font-semibold text-white mb-4 tracking-tight">
            CSV Import Format
          </h3>
          <p className="text-sm text-slate-300 font-light mb-4">
            Upload a CSV file with the following columns to bulk import applications:
          </p>
          <div className="bg-slate-950/50 border border-white/10 rounded-lg p-4 font-mono text-sm">
            <div className="text-blue-300 mb-2">name,vendor,version,category</div>
            <div className="text-slate-400">Slack,Slack Technologies,4.35.0,Communication</div>
            <div className="text-slate-400">Zoom,Zoom Video Communications,5.15.5,Video Conferencing</div>
          </div>
          <p className="text-xs text-slate-500 mt-4 font-light">
            <span className="text-red-400">*</span> Name and vendor are required fields. Version and category are optional.
          </p>
        </div>
      </div>
    </div>
  );
};

