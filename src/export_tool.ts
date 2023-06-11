import AdmZip from "adm-zip";
import { fstat, fstatSync, readFileSync, readdirSync } from "fs";
import path from "path";
import { sys } from "typescript";
import fs from "fs"
if (require.main == module) {
    const args = process.argv.slice(2)
    var zip = new AdmZip();
    if (args.length <= 0) {
        throw new Error("No path given");
    }
    copy_common(zip);
    let full=path.join("build/src/",args[0])
    copy_path(zip,full);
    
     full=path.join("conf",args[0]+".json")
     let conf_content=readFileSync(full)
    add_file(zip,full,conf_content);

    copy_path(zip,"pki")
     

    zip.writeZip(args[0]+".zip");


}
function copy_path(zip:AdmZip,prefix:string){
    for (let file of readdirSync(prefix)) {
        let full=path.join(prefix, file)
        if(fs.statSync(full).isFile()){
            const content=readFileSync(full)
            add_file(zip,full,content)
        }
        else{
            copy_path(zip,full)
        }
        
        
    }
}
function add_file(zip:AdmZip,full:string,content:Buffer){
    zip.addFile(full,content);
}
function copy_common(zip: AdmZip) {
    copy_path(zip,"build/src/common")
    copy_path(zip,"build/src/util");
    add_file(zip,"db.sql",readFileSync("db.sql"));
    add_file(zip,"create_pki.sh",readFileSync("create_pki.sh"));
    add_file(zip,"package.json",readFileSync("package.json"));
   
    
   


}