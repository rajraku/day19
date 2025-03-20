import { readFileSync  } from 'fs';

function eval_time() {    
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const method = descriptor.value!;
        
        descriptor.value = function() {
            const startTime = Date.now()
            const result = method.apply(this,arguments);
            console.log(`Took (${(Date.now() - startTime)}) ms`);
            return result;
        }
    };
}
   

class FileParser
{
    private _requiredPatterns: string[];
    private _towels: Map<string, boolean>;
    private _towelLengths: number[];

    public get requiredPatterns(): string[] {
        return this._requiredPatterns;
    }

    public get towels(): Map<string, boolean> {
        return this._towels;
    }

    public get towelLengths(): number[] {
        return this._towelLengths;
    }


    constructor(filePath: string)
    {
        this._requiredPatterns = [];
        this._towels = new Map<string, boolean>();
        this.parse(filePath);
    }

    parse(filePath: string): void {
        const data = readFileSync(filePath, 'utf8');
        
        const lines = data.split("\n");
        const towelCombinationLength = new Set<number>();

        const line1 = lines[0];

        // available towel patterns
        const towels = line1.split(",");
        towels.forEach(towel => {
            towel = towel.trim();
            towelCombinationLength.add(towel.length);
            this._towels.set(towel, true);
        });

        // sort and save the towel combination lengths
        this._towelLengths = Array.from(towelCombinationLength).sort((a,b)=> a < b? 1: -1);

        for (let i=2; i < lines.length; i++)
        {
            // add the required towel patterns
            this.requiredPatterns.push(lines[i].trim());
        }

    }
}

class Onsen
{
    private _parsedPatterns: Map<string, boolean>
    private _possiblePatterns: Map<string, number>

    constructor(private parsedValues: FileParser)
    {
        this._parsedPatterns = new Map<string, boolean>();
        this._possiblePatterns = new Map<string, number>();
    }

    validDesign(design: string): boolean {
        // if the design is empty then return true just added to avoid the or case
        if (design.length == 0)
        {
            return true;
        }
        // If a design is already parsed then get the result
        if (this._parsedPatterns.has(design)) {
            // should not be a undefined value as we are checking for design availability
            return !!this._parsedPatterns.get(design);
        }
        let hasDesign = false; 
        for (let index = 0; index < this.parsedValues.towelLengths.length; index++) {
            const ptLength = this.parsedValues.towelLengths[index];
            // skip if the pattern length is greater than available design
            if (ptLength > design.length)
            {
                continue;
            }
            let subPattern = design.substring(0, ptLength);
            if (this.parsedValues.towels.has(subPattern) && this.validDesign(design.substring(ptLength)))
            {
                hasDesign = true;
                break;
            }
        }
        if (!this._parsedPatterns.has(design))
        {
            this._parsedPatterns.set(design, hasDesign);
        }
        return hasDesign;
    }

    // Copy of the valid design just to show the difference between part 1 and part 2
    allPossibleDesigns(design: string): number {
        // if the design is empty then return true just added to avoid the or case
        if (design.length == 0)
        {
            return 1;
        }

        // If a design is already parsed then get the result
        if (this._possiblePatterns.has(design)) {
            // should not be a undefined value, sending 0 just to avoid the warning
            return this._possiblePatterns.get(design) ?? 0;
        }
        let validDesign = 0; 
        for (let index = 0; index < this.parsedValues.towelLengths.length; index++) {
            const ptLength = this.parsedValues.towelLengths[index];
            // skip if the pattern length is greater than available design
            if (ptLength > design.length)
            {
                continue;
            }
            let subPattern = design.substring(0, ptLength);
            if (this.parsedValues.towels.has(subPattern))
            {
                validDesign += this.allPossibleDesigns(design.substring(ptLength));
            }
        }
        if (!this._possiblePatterns.has(design))
        {
            this._possiblePatterns.set(design, validDesign);
        }
        return validDesign;
    }


    @eval_time()
    validDesigns(): void {
        const possiblePatterns: string[] = [];
        const impossiblePatterns: string[] = [];

        this.parsedValues.requiredPatterns.forEach( pt =>{
            if (this.validDesign(pt))
            {
                possiblePatterns.push(pt);
            }
            else
            {
                impossiblePatterns.push(pt);
            }
        });

        console.log("Possible Patterns: " + possiblePatterns.length);
        console.log("Impossible Patterns: " + impossiblePatterns.length);

        console.log(impossiblePatterns);
    }


    @eval_time()
    possibleDesigns(): void {
        let designCount = 0;

        this.parsedValues.requiredPatterns.forEach( pt =>{
            designCount  += this.allPossibleDesigns(pt);
        });

        console.log("Total Patterns: " + designCount);
    }
}

const parsedValues = new FileParser("./data/prob1-sample.txt");
const values = new Onsen(parsedValues);

values.validDesigns();
values.possibleDesigns();