// Mock Car Data for Explore Page
export const generateMockCars = (page = 1, limit = 10) => {
  // Create mock car data array with 30 total cars
  const allCars = [];
  
  const carBrands = ['TOYOTA', 'BYD', 'BMW', 'MERCEDES', 'AUDI', 'HONDA'];
  const carModels = {
    'TOYOTA': ['URBAN CRUISER', 'FORTUNER', 'COROLLA'],
    'BYD': ['SONG PLUS', 'ATTO 3', 'HAN'],
    'BMW': ['X5', 'M5', '3 SERIES'],
    'MERCEDES': ['GLE', 'C-CLASS', 'E-CLASS'],
    'AUDI': ['Q7', 'A4', 'A6'],
    'HONDA': ['CR-V', 'CIVIC', 'ACCORD']
  };
  const carTypes = ['SUV', 'SEDAN', 'HATCHBACK', 'COUPE'];
  const trims = ['GLX', 'GLS', 'FLAGSHIP', 'PREMIUM', 'STANDARD'];
  const colors = ['BLACK & RED', 'WHITE & BLACK', 'SILVER & BLACK', 'BLUE & WHITE'];
  const transmissions = ['Automatic', 'Manual'];
  const fuelTypes = ['Petrol', 'Diesel', 'Electric', 'Hybrid'];
  const years = ['2024', '2025', '2023'];
  
  // Generate 30 cars
  for (let i = 1; i <= 30; i++) {
    const brandIndex = i % carBrands.length;
    const brand = carBrands[brandIndex];
    const modelIndex = i % carModels[brand].length;
    const model = carModels[brand][modelIndex];
    const typeIndex = i % carTypes.length;
    const type = carTypes[typeIndex];
    const trimIndex = i % trims.length;
    const trim = trims[trimIndex];
    const colorIndex = i % colors.length;
    const color = colors[colorIndex];
    const transmissionIndex = i % transmissions.length;
    const transmission = transmissions[transmissionIndex];
    const fuelTypeIndex = i % fuelTypes.length;
    const fuelType = fuelTypes[fuelTypeIndex];
    const yearIndex = i % years.length;
    const year = years[yearIndex];
    
    // Create mock car images
    const mockCarImages = [];
    for (let imgIndex = 1; imgIndex <= 4; imgIndex++) {
      mockCarImages.push({
        id: (i * 10) + imgIndex,
        fileId: `file-${i}-${imgIndex}`,
        type: 'exterior',
        order: imgIndex,
        FileSystem: {
          id: `file-${i}-${imgIndex}`,
          path: '/2025-TOYOTA-URBANCRUISER-GLX-1-620558.jpg',
          webpPath: '/2025-TOYOTA-URBANCRUISER-GLX-1-620558.webp',
          thumbnailPath: '/2025-TOYOTA-URBANCRUISER-GLX-1-620558-thumbnail.jpg'
        }
      });
    }
    
    allCars.push({
      id: i,
      stockId: `${brand.slice(0, 3)}-${model.replace(/\s+/g, '').slice(0, 2)}-${i}-${year}`,
      additionalInfo: `${year} ${brand} ${model} ${trim} inside ${color}`,
      engineSize: (Math.floor(Math.random() * 30) + 10) / 10, // Random engine size between 1.0 and 4.0
      Brand: {
        id: brandIndex + 1,
        name: brand,
        slug: brand.toLowerCase()
      },
      CarModel: {
        id: modelIndex + 1,
        name: model,
        slug: model.toLowerCase().replace(/\s+/g, '-')
      },
      Trim: {
        id: trimIndex + 1,
        name: trim,
        slug: trim.toLowerCase()
      },
      Year: {
        id: yearIndex + 1,
        year: parseInt(year)
      },
      CarImages: mockCarImages,
      SpecificationValues: [
        {
          id: 1,
          name: 'GCC',
          Specification: {
            id: 1,
            name: 'Regional Specification',
            key: 'regional_specification'
          }
        },
        {
          id: 2,
          name: 'Left-hand drive',
          Specification: {
            id: 2,
            name: 'Steering Side',
            key: 'steering_side'
          }
        },
        {
          id: 3,
          name: transmission,
          Specification: {
            id: 3,
            name: 'Transmission',
            key: 'transmission'
          }
        },
        {
          id: 4,
          name: type,
          Specification: {
            id: 4,
            name: 'Body Type',
            key: 'body_type'
          }
        },
        {
          id: 5,
          name: fuelType,
          Specification: {
            id: 5,
            name: 'Fuel Type',
            key: 'fuel_type'
          }
        }
      ],
      price: Math.floor(Math.random() * 700000) + 300000, // Random price between 300,000 and 1,000,000
      inWishlist: i % 5 === 0 // Every 5th car is in wishlist
    });
  }
  
  // Calculate pagination
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedCars = allCars.slice(startIndex, endIndex);
  
  // Return paginated response
  return {
    success: true,
    data: {
      cars: paginatedCars,
      total: allCars.length,
      page: page,
      limit: limit,
      totalPages: Math.ceil(allCars.length / limit)
    }
  };
};

export default generateMockCars; 