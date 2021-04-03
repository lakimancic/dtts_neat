class BirdNN {
    constructor(){
        this.input = 4;
        this.hidden = 6;
        this.output = 1;

        this.w1 = [];
        for(let i=0;i<this.hidden;i++){
            let wpom = [];
            for(let j=0;j<this.input;j++){
                wpom.push(Math.random()*2 - 1);
            }
            this.w1.push(wpom);
        }

        this.w2 = [];
        for(let i=0;i<this.output;i++){
            let wpom = [];
            for(let j=0;j<this.hidden;j++){
                wpom.push(Math.random()*2 - 1);
            }
            this.w2.push(wpom);
        }
    }

    forward(inputArr) {
        let hiddenLayer = multiply(this.w1, arrToMat(inputArr))
        let outputLayer = multiply(this.w2, arrToMat(hiddenLayer)) 
        return outputLayer[0][0];
    }

    mate(bird2) {
        let newbird = new BirdNN();

        for(let i=0;i<this.hidden;i++){
            for(let j=0;j<this.input;j++){
                let rand = Math.random();

                if(rand < 0.45){
                    newbird.w1[i][j] = this.w1[i][j];
                }
                else if(rand < 0.9){
                    newbird.w1[i][j] = bird2.w1[i][j];
                }
                else{
                    newbird.w1[i][j] += Math.random()*2 - 1;
                }
            }
        }

        for(let i=0;i<this.output;i++){
            for(let j=0;j<this.hidden;j++){
                let rand = Math.random();

                if(rand < 0.45){
                    newbird.w2[i][j] = this.w2[i][j];
                }
                else if(rand < 0.9){
                    newbird.w2[i][j] = bird2.w2[i][j];
                }
                else{
                    newbird.w2[i][j] += Math.random()*2 - 1;
                }
            }
        }
        return newbird;
    }
}

const multiply = (mat1, mat2) => {
    let product = [];
    for(let i=0;i<mat1.length;i++){
        let ppom = [];
        for(let j=0;j<mat2[0].length;j++){
            ppom.push(0);
        }
        product.push(ppom);
    }
    for(let i=0;i<mat1.length;i++){
        for(let j=0;j<mat2[0].length;j++){
            for(let k=0;k<mat1[0].length;k++){
                product[i][j] += mat1[i][k]*mat2[k][j];
            }
            product[i][j] = reLu(product[i][j]);
        }
    }
    return product;
}

const arrToMat = arr => {
    let mat = [];
    for(let i=0;i<arr.length;i++){
        mat.push([arr[i]]);
    }
    return mat;
}

const sigmoid = num => (1 / (1 + Math.exp(-num)));

const reLu = num => ( Math.max(0, num));