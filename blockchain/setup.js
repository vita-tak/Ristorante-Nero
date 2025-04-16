// setup.js - Automatic contract deployment and restaurant creation
const hre = require('hardhat');

async function main() {
  console.log('🚀 Starting setup script...');

  try {
    // Step 1: Deploy the contract (or get the existing one)
    console.log('📄 Deploying contract...');
    let restaurantAddress;

    try {
      // Try to use ignition for deployment
      const deployments = await hre.ignition.deploy(
        './ignition/modules/Restaurant.js'
      );
      restaurantAddress =
        deployments.deployedContracts['RestaurantModule#Restaurants'].address;
      console.log(`✅ Contract deployed at: ${restaurantAddress}`);
    } catch (error) {
      console.log('⚠️ Ignition deployment failed, trying manual deployment...');

      // Manual deployment fallback
      const RestaurantsFactory = await hre.ethers.getContractFactory(
        'Restaurants'
      );
      const restaurants = await RestaurantsFactory.deploy();
      await restaurants.waitForDeployment();
      restaurantAddress = await restaurants.getAddress();
      console.log(`✅ Contract manually deployed at: ${restaurantAddress}`);
    }

    // Step 2: Check if restaurant exists
    const restaurantsFactory = await hre.ethers.getContractFactory(
      'Restaurants'
    );
    const restaurants = await restaurantsFactory.attach(restaurantAddress);

    let restaurantCount;
    try {
      restaurantCount = await restaurants.restaurantCount();
      console.log(`📊 Current restaurant count: ${restaurantCount}`);
    } catch (error) {
      console.error('❌ Error checking restaurant count:', error.message);
      restaurantCount = 0;
    }

    // Step 3: Create restaurant if needed
    if (restaurantCount == 0) {
      console.log('🍽️ Creating restaurant...');
      const tx = await restaurants.createRestaurant('Italian Restaurant');
      await tx.wait();

      restaurantCount = await restaurants.restaurantCount();
      console.log(`✅ Restaurant created! New count: ${restaurantCount}`);
    } else {
      console.log('✅ Restaurant already exists, no need to create a new one');
    }

    // Print summary
    console.log('\n🎉 Setup complete!');
    console.log(`📝 Contract address: ${restaurantAddress}`);
    console.log(`🏢 Restaurant count: ${restaurantCount}`);
    console.log(`💡 You can use this address in your frontend application`);

    // Print .env variable instructions
    console.log('\n📋 Add this to your frontend/.env file:');
    console.log(`VITE_CONTRACT_ADDRESS=${restaurantAddress}`);
  } catch (error) {
    console.error('❌ Setup failed:', error);
  }
}

// Execute the function
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
