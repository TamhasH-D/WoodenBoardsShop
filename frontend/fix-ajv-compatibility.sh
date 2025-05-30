#!/bin/bash

# Script to fix AJV compatibility issues in React frontend applications
# This script patches schema-utils validate.js files to remove incompatible formatMinimum/formatMaximum keywords

echo "Fixing AJV compatibility issues..."

# Function to fix a validate.js file
fix_validate_file() {
    local file="$1"
    if [ -f "$file" ]; then
        echo "Fixing: $file"
        # Replace the problematic line with a try-catch block
        sed -i.bak 's/ajvKeywords(ajv, \[\x27instanceof\x27, \x27formatMinimum\x27, \x27formatMaximum\x27, \x27patternRequired\x27\]);/try {\n  ajvKeywords(ajv, [\x27instanceof\x27, \x27patternRequired\x27]);\n} catch (e) {\n  console.warn(\x27Some AJV keywords not available:\x27, e.message);\n}/g' "$file"
        
        # Also handle the version with (0, _ajvKeywords.default)
        sed -i.bak 's/(0, _ajvKeywords\.default)(ajv, \[\x27instanceof\x27, \x27formatMinimum\x27, \x27formatMaximum\x27, \x27patternRequired\x27\]);/try {\n  (0, _ajvKeywords.default)(ajv, [\x27instanceof\x27, \x27patternRequired\x27]);\n} catch (e) {\n  console.warn(\x27Some AJV keywords not available:\x27, e.message);\n}/g' "$file"
        
        # Handle double quotes version
        sed -i.bak 's/ajvKeywords(ajv, \["instanceof", "formatMinimum", "formatMaximum", "patternRequired"\]);/try {\n    ajvKeywords(ajv, ["instanceof", "patternRequired"]);\n  } catch (e) {\n    console.warn(\x27Some AJV keywords not available:\x27, e.message);\n  }/g' "$file"
    fi
}

# Fix files in all frontend applications
for app in admin buyer seller; do
    echo "Processing $app frontend..."
    
    # Fix fork-ts-checker-webpack-plugin schema-utils
    fix_validate_file "$app/node_modules/fork-ts-checker-webpack-plugin/node_modules/schema-utils/dist/validate.js"
    
    # Fix babel-loader schema-utils
    fix_validate_file "$app/node_modules/babel-loader/node_modules/schema-utils/dist/validate.js"
    
    # Fix file-loader schema-utils
    fix_validate_file "$app/node_modules/file-loader/node_modules/schema-utils/dist/validate.js"
done

echo "AJV compatibility fixes applied successfully!"
echo "You can now run 'npm run build' in each frontend application."
