import { Map as MapIcon } from 'lucide-react';

export default function TestMap() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-gray-50">
      <div className="rounded-lg bg-white p-8 text-center shadow-sm">
        <MapIcon className="mx-auto mb-4 h-12 w-12 text-blue-600" />
        <h3 className="mb-2 text-xl font-semibold text-gray-900">Test Map</h3>
        <p className="text-sm text-gray-500">Bản đồ thử nghiệm đã sẵn sàng.</p>
      </div>
    </div>
  );
}
