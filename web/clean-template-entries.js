const fs = require('fs');
const path = require('path');

// Clean template entries from backup files before importing to production
function cleanTemplateEntries() {
  const backupDir = './database-backup';
  
  if (!fs.existsSync(backupDir)) {
    console.log('❌ No database-backup directory found');
    return;
  }

  const files = fs.readdirSync(backupDir).filter(file => file.endsWith('.json'));
  
  console.log('🧹 Cleaning template entries from backup files...\n');

  files.forEach(file => {
    const filePath = path.join(backupDir, file);
    
    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      // Filter out template entries
      const cleanData = data.filter(item => 
        !item._id || !item._id.toString().includes('TEMPLATE_SAMPLE_DELETE_AFTER_USE')
      );
      
      if (data.length !== cleanData.length) {
        fs.writeFileSync(filePath, JSON.stringify(cleanData, null, 2));
        console.log(`✅ ${file}: Removed ${data.length - cleanData.length} template entries, kept ${cleanData.length} real entries`);
      } else {
        console.log(`ℹ️ ${file}: No template entries found (${data.length} entries)`);
      }
      
    } catch (error) {
      console.log(`❌ Error processing ${file}: ${error.message}`);
    }
  });

  console.log('\n🎉 Template cleanup completed!');
  console.log('Your backup files are now ready for production import.');
}

// Run cleanup
cleanTemplateEntries();
