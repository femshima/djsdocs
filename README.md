# DjsDocs

## Deploy

### Google Apps Script

1. Clone this project
2. Run `npm i`
3. Login to [clasp](https://github.com/google/clasp)
4. Run `npm run deploy`
5. Create a data folder in your Google account
    1. Download docs from [discordjs/docs](https://github.com/discordjs/docs).
    2. Upload folders in discordjs/docs to the data folder.
       Note that you need to replace the folders to update documentation.
    3. Data folders should look like this:

       ```text
        ├─collection
        │  ├─main.json
        │  └─stable.json
        ├─discord.js
        │  ├─main.json
        │  └─stable.json
        └─ws
           ├─main.json
           └─stable.json
       ```

6. Set required script properties
    - fileId: The ID of the folder from 5.
7. Deploy the GAS project
