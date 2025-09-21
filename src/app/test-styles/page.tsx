export default function TestStyles() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Style Test Page</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Card 1</h2>
            <p className="text-gray-600 mb-4">This is a test card to verify Tailwind CSS is working properly.</p>
            <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
              Test Button
            </button>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Card 2</h2>
            <p className="text-gray-600 mb-4">Another test card with different styling.</p>
            <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded">
              Another Button
            </button>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Card 3</h2>
            <p className="text-gray-600 mb-4">Third test card for verification.</p>
            <button className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded">
              Purple Button
            </button>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-8 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">Gradient Test</h2>
          <p className="text-lg">This should show a blue to purple gradient background.</p>
        </div>
      </div>
    </div>
  )
}
