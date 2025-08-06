'use client';

export default function EnvCheck() {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  
  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4">Environment Check</h1>
      <div className="space-y-2">
        <p><strong>NEXT_PUBLIC_CONVEX_URL:</strong></p>
        <p className="font-mono text-sm bg-gray-100 p-2 rounded">
          {convexUrl || 'Not set'}
        </p>
        <div className={`p-2 rounded ${convexUrl ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {convexUrl ? '✅ Convex URL is configured' : '❌ Convex URL is missing'}
        </div>
      </div>
    </div>
  );
}