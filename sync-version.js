const fs = require('fs');

// Read the version data from your package.json
const pkg = require('./package.json');
const version = pkg.version;
const code = pkg.versionCode;

console.log(`Syncing iOS Blueprint -> Version: ${version} | Build: ${code}`);

// Path to your Xcode project file (Adjust 'TaskByte' if your project folder is named differently)
const iosProjectPath = './ios/TaskByte.xcodeproj/project.pbxproj';

try {
  let pbxproj = fs.readFileSync(iosProjectPath, 'utf8');

  // Safely replace the dynamic Xcode build variables globally
  pbxproj = pbxproj.replace(
    /MARKETING_VERSION = .*;/g,
    `MARKETING_VERSION = ${version};`,
  );
  pbxproj = pbxproj.replace(
    /CURRENT_PROJECT_VERSION = .*;/g,
    `CURRENT_PROJECT_VERSION = ${code};`,
  );

  fs.writeFileSync(iosProjectPath, pbxproj);
  console.log('✅ iOS updated successfully.');
} catch (e) {
  console.error(
    '❌ Failed to update iOS. Check if the project name is correct.',
    e.message,
  );
  process.exit(1); // Fail the script if the file isn't found
}
