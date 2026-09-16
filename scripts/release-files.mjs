// Reviewed paths only. Updating the public set requires editing public-files.json.
import { readFile, lstat, mkdir, copyFile, realpath } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { resolve, dirname, relative, isAbsolute, sep } from "node:path";
import { fileURLToPath } from "node:url";
const root=resolve(dirname(fileURLToPath(import.meta.url)),"..");
const manifest=JSON.parse(await readFile(resolve(root,"public-files.json"),"utf8"));
if(manifest.version!==1 || !Array.isArray(manifest.files) || new Set(manifest.files).size!==manifest.files.length)throw Error("Invalid release manifest.");
const prohibited=/(^|\/)(node_modules|dist|test-results|release-private|\.git|\.agents|\.codex|archive)(\/|$)|(^|\/)(AGENTS\.md|\.env(\..*)?|\.dev\.vars|.*\.(pem|key|dpapi|sqlite|db))$/i;
for(const file of manifest.files){
  if(typeof file!=="string" || isAbsolute(file) || file.includes("\\") || file.split("/").some(p=>p===".."||p===".") || (prohibited.test(file)&&file!=="app/.dev.vars.example"))throw Error("Disallowed release path: "+file);
  const source=resolve(root,file), actual=await realpath(source);
  if(!actual.startsWith((await realpath(root))+sep) || !(await lstat(source)).isFile())throw Error("Not a regular source file: "+file);
}
if(process.argv[2]==="--check"){
  const tracked=execFileSync("git",["-C",root,"ls-files","-z"],{encoding:"utf8"}).split("\0").filter(Boolean).sort();
  const allowed=[...manifest.files].sort();
  if(JSON.stringify(tracked)!==JSON.stringify(allowed))throw Error("Tracked files differ from reviewed public-files.json. Review additions/removals before updating the manifest.");
  console.log("Reviewed release file list matches "+tracked.length+" tracked files.");
}else if(process.argv[2]==="--export" && process.argv[3]){
  const target=resolve(process.argv[3]);
  if(target===root || relative(root,target).startsWith("..")===false)throw Error("Export to a separate new directory outside the source tree.");
  await mkdir(target,{recursive:false});
  for(const file of manifest.files){const destination=resolve(target,file);await mkdir(dirname(destination),{recursive:true});await copyFile(resolve(root,file),destination);}
  console.log("Exported "+manifest.files.length+" reviewed files to "+target);
}else throw Error("Use --check in a clean checkout, or --export <new-directory>.");
