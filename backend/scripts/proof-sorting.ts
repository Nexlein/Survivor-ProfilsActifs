import fs from 'fs';

const API_URL = 'http://localhost:3000/profile/all';

async function fetchAllIds(): Promise<string[]> {
    let page = 1;
    const ids: string[] = [];
    while (true) {
        const res = await fetch(`${API_URL}?page=${page}`);
        const data = await res.json();
        const profiles = data.profiles;
        if (profiles.length === 0) break;
        profiles.forEach((p: any) => ids.push(p.id));
        page++;
    }
    return ids;
}

async function main() {
    console.log('Fetching catalog pass 1...');
    const list1 = await fetchAllIds();
    fs.writeFileSync('pass1_ids.txt', list1.join('\n'));
    
    console.log('Fetching catalog pass 2...');
    const list2 = await fetchAllIds();
    fs.writeFileSync('pass2_ids.txt', list2.join('\n'));

    const isIdentical = JSON.stringify(list1) === JSON.stringify(list2);
    const hasDuplicates = new Set(list1).size !== list1.length;
    
    console.log('--- SORTING PROOF REPORT ---');
    console.log(`Total profiles retrieved: ${list1.length}`);
    console.log(`Are the two lists identical? ${isIdentical ? 'YES' : 'NO'}`);
    console.log(`Are there duplicates? ${hasDuplicates ? 'YES' : 'NO'}`);
    
    fs.writeFileSync('sorting_proof_report.txt', `Total: ${list1.length}\nIdentical: ${isIdentical}\nDuplicates: ${hasDuplicates}\n`);
}

main().catch(console.error);
