const fs = require('fs');
const content = fs.readFileSync('src/renderer/components/compendium/DetalleBaseDatos.tsx', 'utf8');

const lines = content.split('\n');
const newContent = lines.slice(0, 434).join('\n') + `
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      </>
                      )}
                    </div>
                  </div>
                );
};
`;
fs.writeFileSync('src/renderer/components/compendium/DetalleBaseDatos.tsx', newContent);
console.log("Fixed DatabaseDetail.tsx");
