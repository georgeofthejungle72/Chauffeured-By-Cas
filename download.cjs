const fs = require('fs');
const https = require('https');
const url = 'https://scontent-sof1-2.cdninstagram.com/v/t51.82787-15/544128389_18150451909400243_2023119882206332083_n.heic?stp=c288.0.864.864a_dst-jpg_e35_s640x640_tt6&_nc_cat=107&ccb=7-5&_nc_sid=18de74&efg=eyJlZmdfdGFnIjoiQ0FST1VTRUxfSVRFTS5iZXN0X2ltYWdlX3VybGdlbi5DMyJ9&_nc_ohc=D_86yfzZIRIQ7kNvwGzp4wo&_nc_oc=Ado7A3OPWH0B8ShNqIAqye_eiYHqMQjgu9ofTYRMuj3Sw9i4csnNkmy4Ny8ebJ9goJxcGGDjfRrfR1l7m0I2CtzR&_nc_zt=23&_nc_ht=scontent-sof1-2.cdninstagram.com&_nc_gid=lOCMJUCi_fRWmegtwci39Q&_nc_ss=7f689&oh=00_Af48PH9XpwJEHCqGQapOLvfeThFpKs33gSVZmmaD97_Mfw&oe=6A050AD8';

fs.mkdirSync('public', { recursive: true });
https.get(url, (res) => {
  res.pipe(fs.createWriteStream('public/why-mts.jpg'));
  res.on('end', () => console.log('Downloaded'));
});
