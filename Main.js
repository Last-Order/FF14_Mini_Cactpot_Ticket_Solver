let $vm = new Vue({
    el: '#app',
    data() {
        return {
            num1: 0,
            num2: 0,
            num3: 0,
            num4: 0,
            num5: 0,
            num6: 0,
            num7: 0,
            num8: 0,
            num9: 0,
            possibleCombinations: [
                [1, 2, 3],
                [4, 5, 6],
                [7, 8, 9],
                [1, 4, 7],
                [2, 5, 8],
                [3, 6, 9],
                [1, 5, 9],
                [3, 5, 7]
            ],
            gain: {
                6: 10000,
                7: 36,
                8: 720,
                9: 360,
                10: 80,
                11: 252,
                12: 108,
                13: 72,
                14: 54,
                15: 180,
                16: 72,
                17: 180,
                18: 119,
                19: 36,
                20: 306,
                21: 1080,
                22: 144,
                23: 1800,
                24: 3600
            },
            tip: '把数字填好，4个，不要重复'
        }
    },
    computed: {

    },
    methods: {
        getNumberOfFilledBlock() {
            let self = this;
            let count = 0;
            Array.from(Array(10).keys()).slice(1).forEach(index => {
                if (self['num' + index] !== 0) {
                    count++;
                }
            });
            return count;
        },
        getUsedNumber() {
            let self = this;
            let result = [];
            Array.from(Array(10).keys()).slice(1).forEach(index => {
                if (self['num' + index] !== 0) {
                    result.push(self['num' + index]);
                }
            });
            return result;
        },
        check() {
            if (this.getNumberOfFilledBlock() === 4) {
                // make sure every block has a unique number
                let usedNumber = this.getUsedNumber();
                for (let number of usedNumber) {
                    if (usedNumber.filter(i => i == number).length > 1) {
                        // has duplicated number.
                        console.log('Each number should appear only once.')
                        return;
                    }
                }
                this.calculate();
            }
        },
        calculate(data = this) {
            let self = this;
            let usedNumber = this.getUsedNumber();
            let unusedNumber = $(Array.from(Array(10).keys()).slice(1)).not(usedNumber).get();

            let finalResult = {};

            for (let combination of this.possibleCombinations) {
                let dataSet = [];
                Array.from(Array(10).keys()).slice(1).forEach(index => {
                    dataSet[index - 1] = data['num' + index];
                })
                //console.log('For combination ' + combination + ': ');
                let needShuffle = [];
                for (let index of combination) {
                    if (dataSet[index - 1] === 0)
                        needShuffle.push(index);
                }
                //console.log('there are ' + needShuffle.length + ' empty block(s).');
                if (needShuffle.length === 0) {
                    // all the numbers in this condition are fixed.
                    // so, the result is fixed.
                    let result = 0;
                    combination.forEach(index => result += dataSet[index - 1]);
                    //console.log(self.gain[result] + ' ... 100%');
                    //console.log('预期收益:' + self.gain[result]);
                    finalResult[combination.toString()] = self.gain[result];
                }
                else if (needShuffle.length === 1) {
                    // 1 block need shuffle.
                    // but every result will be appeared only once.
                    // and the possibility is simply averanged.
                    let results = [];
                    for (let number of unusedNumber) {
                        let sum = 0;
                        dataSet[needShuffle[0] - 1] = number;
                        combination.forEach(index => sum += dataSet[index - 1]);
                        results.push(sum);
                    }

                    let sum = 0;
                    for (let result of results) {
                        sum += self.gain[result];
                        console.log(self.gain[result] + ' ... ' + 1 / results.length * 100 + '%');
                    }
                    console.log('预期收益: ' + sum / results.length);
                    finalResult[combination.toString()] = sum / results.length;
                }
                else if (needShuffle.length === 2) {
                    // 2 blocks need shuffle.
                    // this occasion is a little bit more complex.
                    let result = {};
                    // define a object to record result.
                    // the key of this object is the sum of different occasions while the value is how many time it appeared.
                    for (let firstNumber of unusedNumber) {
                        for (let secondNumber of unusedNumber.filter(i => i !== firstNumber)) {
                            dataSet[needShuffle[0] - 1] = firstNumber;
                            dataSet[needShuffle[1] - 1] = secondNumber;
                            let sum = 0;
                            combination.forEach(index => sum += dataSet[index - 1]);
                            result[self.gain[sum]] = result[self.gain[sum]] ? result[self.gain[sum]] + 1 : 1;
                        }
                    }

                    let expectedGain = 0;
                    for (let key of Object.keys(result)) {
                        expectedGain += key * (result[key] / 20);
                        console.log(key + ' ... ' + result[key] / 20 * 100 + '%');
                    }
                    console.log('预期收益: ' + expectedGain);
                    finalResult[combination.toString()] = expectedGain;
                }
                else {
                    if (needShuffle.length === 3) {
                        // 3 blocks need shuffle
                        let result = {};
                        for (let firstNumber of unusedNumber) {
                            for (let secondNumber of unusedNumber.filter(i => i !== firstNumber)) {
                                for (let thirdNumber of unusedNumber.filter(i => ![firstNumber, secondNumber].includes(i))) {
                                    dataSet[needShuffle[0] - 1] = firstNumber;
                                    dataSet[needShuffle[1] - 1] = secondNumber;
                                    dataSet[needShuffle[2] - 1] = thirdNumber;
                                    let sum = 0;
                                    combination.forEach(index => sum += dataSet[index - 1]);
                                    result[self.gain[sum]] = result[self.gain[sum]] ? result[self.gain[sum]] + 1 : 1;
                                }
                            }
                        }

                        let expectedGain = 0;
                        for (let key of Object.keys(result)) {
                            expectedGain += key * (result[key] / 60);
                            console.log(key + ' ... ' + result[key] / 60 * 100 + '%');
                        }
                        console.log('预期收益: ' + expectedGain);
                        finalResult[combination.toString()] = expectedGain;
                    }
                }
            }

            console.log(JSON.stringify(finalResult, null, 2));

            let highest = 0;
            let highestKey;
            for (let key of Object.keys(finalResult)) {
                if (finalResult[key] > highest) {
                    highest = finalResult[key];
                    highestKey = key
                }
            }

            this.tip = `选择${highestKey}可以获得${highest}的最高收益。`;

            let sum = 0;
            for (let key of Object.keys(finalResult)) {
                sum += finalResult[key];
            }
            return sum / 9;
        },
        // whereToStart() {
        //     let self = this;
        //     let possibleInitialBlockIndexes = [];
        //     let allNumber = Array.from(Array(10).keys()).slice(1);
        //     let data = {};
        //     let result = {};
        //     // generate
        //     for (let i of allNumber) {
        //         for (let j of allNumber.filter(v => ![i].includes(v))) {
        //             for (let k of allNumber.filter(v => ![i, j].includes(v))) {
        //                 for (let l of allNumber.filter(v => ![i, j, k].includes(v))) {
        //                     possibleInitialBlockIndexes.push([i, j, k, l]);
        //                 }
        //             }
        //         }
        //     }
        //     let count = 0;
        //     for (let combination of possibleInitialBlockIndexes) {
        //         console.log(++count/3024*100 + '%');
        //         for (let i of allNumber) {
        //             for (let j of allNumber.filter(v => ![i].includes(v))) {
        //                 for (let k of allNumber.filter(v => ![i, j].includes(v))) {
        //                     for (let l of allNumber.filter(v => ![i, j, k].includes(v))) {
        //                         [i, j, k, l].forEach(v => {
        //                             [0, 1, 2, 3].forEach(i => {
        //                                 data['num' + combination[i]] = {
        //                                     0: i,
        //                                     1: j,
        //                                     2: k,
        //                                     3: l
        //                                 }[i];
        //                             });
        //                             result[combination.toString()] = self.calculate(data);
        //                         })
        //                     }
        //                 }
        //             }
        //         }
        //     }
        //     window.result = result;
        // }
    },
})