{/* Mixed Selection Examples */}
              <>
                <div className="relative">
                  <input 
                    type="checkbox" 
                    className="absolute top-2 right-2 w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <PlayerBox 
                    player={{...samplePlayers[0], displayName: "Sarah J", positionPreferences: ["WA", "C"], avatarColor: "bg-blue-500"}}
                    size="sm"
                    showPositions={true}
                    className="shadow-md transition-shadow duration-200 hover:shadow-lg"
                    style={{ borderColor: '#3b82f6', color: '#1d4ed8' }}
                  />
                </div>
                <div className="relative">
                <input 
                  type="checkbox" 
                  checked
                  className="absolute top-2 right-2 w-4 h-4 text-green-600 bg-green-600 border-green-600 rounded focus:ring-green-500 focus:ring-2"
                />
                <PlayerBox 
                  player={{...samplePlayers[1], displayName: "Emma T", positionPreferences: ["GS", "GA"], avatarColor: "bg-green-500"}}
                  size="sm"
                  showPositions={true}
                  className="shadow-md transition-shadow duration-200 hover:shadow-lg"
                  style={{ borderColor: '#16a34a', color: '#15803d' }}
                />
              </div>
              <div className="relative">
                <input 
                  type="radio" 
                  name="captain"
                  className="absolute top-2 right-2 w-4 h-4 text-purple-600 bg-white border-gray-300 focus:ring-purple-500 focus:ring-2"
                />
                <PlayerBox 
                  player={{...samplePlayers[2], displayName: "Lily C", positionPreferences: ["GK", "GD"], avatarColor: "bg-purple-500", active: true}}
                  size="sm"
                  showPositions={true}
                  className="shadow-md transition-shadow duration-200 hover:shadow-lg"
                  style={{ borderColor: '#a855f7', color: '#7c3aed' }}
                />
              </div>
              <div className="relative">
                <input 
                  type="radio" 
                  name="captain"
                  checked
                  className="absolute top-2 right-2 w-4 h-4 text-pink-600 bg-pink-600 border-pink-600 focus:ring-pink-500 focus:ring-2"
                />
                <PlayerBox 
                  player={{...samplePlayers[3], displayName: "Sophie M", positionPreferences: ["WD", "C"], avatarColor: "bg-pink-500"}}
                  size="sm"
                  showPositions={true}
                  className="shadow-md transition-shadow duration-200 hover:shadow-lg"
                  style={{ borderColor: '#ec4899', color: '#be185d' }}
                />
              </div>
              </>