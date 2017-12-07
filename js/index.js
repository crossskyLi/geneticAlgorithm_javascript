var app = new Vue({
    el: '#main',
    data: {
        sizepop: 50, //种群的数目
        lenchrom: 5, //染色体长度
        bound_up: (0.9 * Math.PI), //上界
        bound_down: 0,// 下界
        fitness: [], //种群每个个体的适应度
        chrom: [],// 种群数组
        fitness_prob: [],// 每个个体被选中的概率
        pcross: 0.6, // 交叉概率
        pmutation: 0.1,// 变异概率
        maxgen: 500,// 进化代数
        gbest: 0, // 所有进化中的最优值
        gbest_index: 0, // 取得最优值的迭代次数序号
        average_best: [], // 每一代平均最优值
        gbest_pos: [],// 取最优值的位置
        methodList: [
            {
                name: '-5*sin(x1)*sin(x2)*sin(x3)*sin(x4)*sin(x5) - sin(5*x1)*sin(5*x2)*sin(5*x3)*sin(5*x4)*sin(5*x5) + 8',
                isActive: true,
                method: function (arr) {
                    var firstXResult = -5;
                    var secondXResult = 1;
                    arr.forEach(function (item) {
                        firstXResult = firstXResult * Math.sin(item);
                        secondXResult = secondXResult * Math.sin(5 * item);
                    });
                    var result = parseFloat(firstXResult - secondXResult + 8);
//                        console.log('+++', result);
                    return result;
                }
            },
            {
                name: 'sin(x1)*sin(x2)*sin(x3)*sin(x4)*sin(x5) - sin(5*x1)*sin(5*x2)*sin(5*x3)*sin(5*x4)*sin(5*x5)',
                isActive: false,
                method: function () {
//                        var firstXResult = 1;
//                        var secondXResult = 1;
//                        arr.forEach(function (item, index) {
//                            firstXResult = firstXResult * Math.sin(item);
//                            secondXResult = secondXResult * Math.sin(5 * item);
//                        });
//                        var result = parseFloat((firstXResult - secondXResult).toFixed(6));
////                        console.log('+++', result);
//                        return result;
                }
            }
        ],
        activeMethod: {},
        paramList: [
            {name: '参数名字1', value: ''},
            {name: '参数名字2', value: ''},
            {name: '参数名字3', value: ''}
        ],
        //结果显示
        contrastResults: [
            {str: '', isChange: false}
        ],
        isCalculating:true,
        isUnChangeCanShow: false,
        showUnChangeBtnStr:'显示全部对比'
    },
    mounted: function () {
        this.activeMethod = this.methodList[0];
    },
    methods: {

        // 选择目标函数
        getActiveMethod: function (item) {
            this.activeMethod = item;
            this.methodList.forEach(function (t) {
                t.isActive = false;
            });
            item.isActive = true;
        },
        // 求和函数
        sum: function (arr) {//param??
            var sum_fit = 0;
            for (var i = 1; i < this.sizepop; i++) {
                sum_fit += arr[i]
            }
            return sum_fit
        },
        //求最小值函数
        min: function (fitness) {

            var min_fit = fitness[0];// double min_fit = *fitness;
            var min_index = 0;
            var arr = [0, 0];
            for (var i = 1; i < this.sizepop; i++) {
                if (fitness[i] < min_fit) {
                    min_fit = fitness[i];
                    min_index = i;
                }
            }
            arr[0] = min_index;
            arr[1] = min_fit;
            return arr;
        },
        //种群初始化
        init_chrom: function () {
            var chrom = [];
            var fitness = [];
            for (var i = 0; i < this.sizepop; i++) {
                var arr = [];
                for (var j = 0; j < this.lenchrom; j++) {
                    var value = parseFloat(this.bound_up * Math.random());
//                        console.log("初始值", value, this.bound_up)
                    arr.push(value);
                }
                chrom.push(arr);
                // 初始化适应度
                fitness[i] = this.activeMethod.method(chrom[i]);
            }
            return {
                chrom: chrom,
                fitness: fitness
            };
        },
        // 选择操作
        select: function (chrom, fitness, fitness_prob) {
            var selectChrom = chrom;
            var selectFitness = fitness;
            var select_fitness_prob = fitness_prob;
            var index = new Array(this.sizepop);
            for (var i = 0; i < this.sizepop; i++) {
                var arr = selectChrom[i];
                selectFitness[i] = 1 / (this.activeMethod.method(arr));
            }
            var sum_fitness = 0;
            for (var j = 0; j < this.sizepop; j++) {
                sum_fitness += selectFitness[j] // 适应度求和
            }

            for (var k = 0; k < this.sizepop; k++) {
                select_fitness_prob[k] = selectFitness[k] / sum_fitness;
            }
            for (var l = 0; l < this.sizepop; l++) {
                selectFitness[l] = 1 / selectFitness[l] // 恢复函数值
            }

            for (var m = 0; m < this.sizepop; m++) {
                var pick = Math.random();
                while (pick < 0.0001) {
                    pick = Math.random();
                }
                for (var n = 0; n < this.sizepop; n++) {
//                        console.log(n, 'select_fitness_prob', select_fitness_prob[n])
                    pick = pick - select_fitness_prob[n];
                    if (pick <= 0) {
                        index[m] = n;
                        break;
                    }
                }
            }
//                console.log(index)


            for (var a = 0; a < this.sizepop; a++) {
                for (var b = 0; b < this.lenchrom; b++) {
//                        console.log(a, selectChrom[index[a]])
                    selectChrom[a][b] = selectChrom[index[a]][b];
                }
                this.fitness[a] = this.fitness[index[a]]
            }

            return {
                chrom: selectChrom,
                fitness: selectFitness,
                fitness_prob: select_fitness_prob,
            };
        },
        //交叉操作
        cross: function (chrom) {
            var crossChrom = chrom;
            for (var i = 0; i < this.sizepop; i++) {
                // 两个随机选取的染色体序号
                var choice1 = parseInt(Math.random() * (this.sizepop - 1));
                var choice2 = parseInt(Math.random() * (this.sizepop - 1));
                var pick = Math.random();// 用于决定是否进行交叉操作
                if (pick > this.pcross) {
                    continue;
                }
                var flag = 0;
                var pos = 0;
                while (flag === 0) {
                    var newPick = Math.random();
                    pos = parseInt(newPick * this.lenchrom);
                    while (pos > this.lenchrom - 1) {
                        newPick = Math.random();
                        pos = parseInt(newPick * this.lenchrom);// 处理越界
                    }

                    // 交叉开始
                    var r = Math.random();
                    var v1 = crossChrom[choice1][pos];
                    var v2 = crossChrom[choice2][pos];
                    crossChrom[choice1][pos] = r * v2 + (1 - r) * v1;
                    crossChrom[choice2][pos] = r * v1 + (1 - r) * v2; //交叉结束
                    if (crossChrom[choice1][pos] >= this.bound_down &&
                        crossChrom[choice1][pos] <= this.bound_up &&
                        crossChrom[choice2][pos] >= this.bound_down &&
                        crossChrom[choice2][pos] <= this.bound_up) {
                        flag = 1;
                    }
                }
            }
            return crossChrom;
        },
        // 变异操作
        mutation: function (chrom) {
            var mutationChrom = chrom;
            for (var i = 0; i < this.sizepop; i++) {
                var pick = Math.random();
                var choice = parseInt(pick * this.sizepop);
                while (choice > this.sizepop - 1) {
                    pick = Math.random();
                    choice = parseInt(pick * this.sizepop);//处理下标越界
                }
                pick = Math.random(); // 决定是否进行变异
                if (pick > this.pmutation) {
                    continue;
                }
                pick = Math.random();
                var pos = parseInt(pick * this.lenchrom);

                while (pos > this.lenchrom - 1) {
                    pick = Math.random();
                    pos = parseInt(pick * this.lenchrom)
                }
                var v = mutationChrom[i][pos];
                var v1 = v - this.bound_up;

                var v2 = this.bound_down - v;

                var r = Math.random();
                var r1 = Math.random();
                if (r >= 0.5) {
                    mutationChrom[i][pos] = v - v1 * r1 * (1 - (i / this.maxgen) * (1 - (i / this.maxgen)));
                } else {
                    mutationChrom[i][pos] = v + v2 * r1 * (1 - (i / this.maxgen) * (1 - (i / this.maxgen)))
                }
            }
            return mutationChrom
        },
        //计算操作
        calculate: function () {
            // 这三行看不懂
            // time_t start,finish;
            // start = clock(); // 程序开始计时
            // srand((unsigned)time(NULL)); // 初始化随机数种子
            this.contrastResults = [];
            var init = this.init_chrom();
            var chrom = init.chrom;
            var fitness = init.fitness;
            var best_fit_index_arr = this.min(fitness);
            var best_index = parseInt(best_fit_index_arr[0]);
            var fitness_prob = [];//每个种群被选择的概率
            this.gbest = best_fit_index_arr[1];// 最优值
            this.gbest_index = 0;
            this.average_best[0] = this.sum(fitness) / this.sizepop;//初始化平均最优值
            for (var i = 0; i < this.lenchrom; i++) {
                this.gbest_pos[i] = parseFloat(chrom[best_index][i].toString());
            }
            //进化开始
            for (var j = 0; j < this.maxgen; j++) {
                // 选择
                var selectChromInit = this.select(chrom, fitness, fitness_prob);// 选择
                var selectChrom = selectChromInit.chrom;

                fitness = selectChromInit.fitness;
                fitness_prob = selectChromInit.fitness_prob;
                // 交叉
                var crossChrom = this.cross(selectChrom); // 交叉
                //变异
                chrom = this.mutation(crossChrom); // 变异
                for (var k = 0; k < this.sizepop; k++) {
                    fitness[k] = this.activeMethod.method(chrom[k])
                }
                var sum_fit = this.sum(fitness);
                this.average_best[j + 1] = sum_fit / this.sizepop;// 平均最优值
                var arr = this.min(fitness);
                var new_best = arr[1];
                var new_best_index = parseInt(arr[0]);
                var isChange = false;
                var str = '最优:    ' + this.gbest + '     新的最优:   ' + new_best;
                if (new_best < this.gbest) {
                    this.gbest = new_best;
                    isChange = true;
                    for (var l = 0; l < this.lenchrom; l++) {
//                            console.log(chrom[new_best_index][l])
                        this.gbest_pos[l] = parseFloat(chrom[new_best_index][l].toString());
                    }
                    this.gbest_index = j + 1;
                }
                this.contrastResults.push({isChange: isChange, str: str})
            }
            console.log("遗传算法次数", this.maxgen);
            console.log("最优值", this.gbest);
            console.log("最优值在第几代取得", this.gbest_index);
            console.log("此代的平均最优值", this.average_best[this.gbest_index]);
            console.log("取得最优值的地方为", this.gbest_pos[0], this.gbest_pos[1], this.gbest_pos[2], this.gbest_pos[3], this.gbest_pos[4]);
            this.isCalculating = false;
        },
        // 显示隐藏没有变化的对比
        showUnChange: function () {
            this.isUnChangeCanShow = !this.isUnChangeCanShow;
            if( this.isUnChangeCanShow ){
                this.showUnChangeBtnStr =  '隐藏全部对比';
            }
        }
    }
})