// Script to set driver custom claims
const driverUID = 'Tmw5ttJRM1TbqMdT9FTQ028Dljh2';

async function setDriverClaims() {
  try {
    console.log('🔧 Setting driver custom claims...');

    const response = await fetch('http://localhost:3011/api/set-driver-role', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ uid: driverUID }),
    });

    const result = await response.json();

    if (result.success) {
      console.log('✅ Driver role set successfully!');
      console.log('👤 UID:', result.uid);
    } else {
      console.error('❌ Failed to set driver role:', result.message);
    }

  } catch (error) {
    console.error('❌ Error setting driver claims:', error);
  }
}

setDriverClaims();
