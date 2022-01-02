/** @param {NS} ns **/
export async function main(ns) {
	ns.disableLog("ALL");
    ns.clearLog();

    const url = "http://127.0.0.1:5500";
    const tempfile = "/temp/files.txt";

    await ns.wget(`${url}/temp/files.json`, tempfile);

    const json = ns.read(tempfile);
    const files = JSON.parse(json);

	for(const file of files) {
        const src = `${url}/${file}`;
        let dest = file.replace(/\\/g, "/");
        dest = dest.replace("dist", "");
        if ((dest.split("/").length - 1) === 1) {
            dest = dest.replace("/", "");
        }

		const success = await ns.wget(src, dest);
		if (!success) ns.print(`ERROR - Failed to get ${src}`);
	}
    ns.rm(tempfile, "home");
}
