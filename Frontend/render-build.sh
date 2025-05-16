#!/usr/bin/env bash
# Exit on error
set -o errexit

echo "Installing dependencies..."
npm install

echo "Building the Angular application..."
npm run build

echo "Setting up deployment files..."
cd dist/user-management-system

# Create _redirects file
echo "/* /index.html 200" > _redirects

# Create a basic web.config for IIS
cat > web.config << EOL
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
    <system.webServer>
        <rewrite>
            <rules>
                <rule name="Angular Routes" stopProcessing="true">
                    <match url=".*" />
                    <conditions logicalGrouping="MatchAll">
                        <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
                        <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
                    </conditions>
                    <action type="Rewrite" url="/index.html" />
                </rule>
            </rules>
        </rewrite>
    </system.webServer>
</configuration>
EOL

echo "Deployment files setup completed!" 