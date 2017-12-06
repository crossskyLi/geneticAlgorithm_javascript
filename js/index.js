var app = new Vue({
    el: '#main',
    data: {
        sizepop: 10, //种群的数目
        lenchrom: 5, //染色体长度
        bound_up: (0.9 * Math.PI), //上界
        bound_down: 0,// 下界
        fitness: [], //种群每个个体的适应度
        chrom: new Array(this.sizepop),// 种群数组
        fitness_prob: [],// 每个个体被选中的概率
        pcross: 0.6, // 交叉概率
        pmutation: 0.1,// 变异概率
        maxgen: 1,// 进化代数
        gbest: 0, // 所有进化中的最优值
        gbest_index: 0, // 取得最优值的迭代次数序号
        average_best: [], // 每一代平均最优值
        gbest_pos: [],// 取最优值的位置
        methodList: [
            {
                name: '目标函数名字1',
                isActive: true,
                method: function (arr) {
                    var firstXResult = -5;
                    var secondXResult = 1;
                    arr.forEach(function (item, index) {
                        firstXResult = firstXResult * Math.sin(item);
                        secondXResult = secondXResult * Math.sin(5 * item);
                    });
                    var result = parseFloat((firstXResult - secondXResult + 8).toFixed(6));
                    return result;
                }
            },
            {
                name: '目标函数名字2',
                isActive: false,
                method: function () {
                    return 2
                }
            }
        ],
        activeMethod: {},
        paramList: [
            {name: '参数名字1', value: ''},
            {name: '参数名字2', value: ''},
            {name: '参数名字3', value: ''}
        ]
    },
    mounted: function () {
        this.activeMethod = this.methodList[0];
        for (var i = 0; i < this.sizepop; i++) {
            var iStr = i.toString();
            this.chrom[iStr] = [];
        }

    },
    methods: {
        // 选择目标函数
        getActiveMethod: function (item) {
            this.activeMethod = item;
            this.methodList.forEach(function (t) {
                t.isActive = false
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
            for (var i = 0; i < this.sizepop; i++) {
                for (var j = 0; j < this.lenchrom; j++) {
                    this.chrom[i][j] = parseFloat((this.bound_up * Math.random()).toFixed(6));
                }
                // 初始化适应度
                this.fitness[i] = this.activeMethod.method(this.chrom[i])
            }
        },
        // 选择操作
        select: function (chrom) {
            var index = [];
            for (var i = 0; i < this.sizepop; i++) {
                var arr = this.chrom[i] // 这里的arr????
                // 求最小值,适应度为目标函数的倒数
                // 即函数值越小,适应度越大,
                this.fitness[i] = 1 / (this.activeMethod.method(arr))
            }

            var sum_fitness = 0;
            for (var j = 0; j < this.sizepop; j++) {
                sum_fitness += this.fitness[j] // 适应度求和
            }

            for (var k = 0; k < this.sizepop; k++) {
                this.fitness_prob[k] = this.fitness[k] / sum_fitness;
            }

            for (var l = 0; l < this.sizepop; l++) {
                this.fitness[l] = 1 / this.fitness[l] // 恢复函数值
            }

            for (var m = 0; m < this.sizepop; m++) {
                var pick = Math.random();
                while (pick < 0.0001) {
                    pick = Math.random();
                }
                for (var n = 0; n < this.sizepop; n++) {
                    pick = pick - this.fitness_prob[n];
                    if (pick <= 0) {
                        index[m] = n;
                        break;
                    }
                }
            }

            for (var a = 0; a < this.sizepop; a++) {
                for (var b = 0; b < this.lenchrom; b++) {
                    this.chrom[a][b] = this.chrom[index[a][b]];
                }
                this.fitness[a] = this.fitness[index[a]]
            }

        },

        //交叉操作
        cross: function (chrom) {
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
                while (!flag) {
                    var newPick = Math.random();
                    pos = parseInt(newPick * this.lenchrom);
                    while (pos > this.lenchrom - 1) {
                        newPick = Math.random();
                        pos = parseInt(newPick * this.lenchrom);// 处理越界
                    }
                    // 交叉开始
                    var r = Math.random();
                    var v1 = this.chrom[choice1][pos];
                    var v2 = this.chrom[choice2][pos];
                    this.chrom[choice1][pos] = r * v2 + (1 - r) * v1;
                    this.chrom[choice2][pos] = r * v1 + (1 - r) * v2; //交叉结束
                    if (this.chrom[choice1][pos] >= this.bound_down &&
                        this.chrom[choice1][pos] <= this.bound_up &&
                        this.chrom[choice2][pos] >= this.bound_down &&
                        this.chrom[choice2][pos] <= this.bound_up) {
                        flag = 1;
                    }
                }

            }
        },
        // 变异操作
        mutation: function (chrom) {
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
                var v = this.chrom[i][pos];
                var v1 = v - this.bound_up;
                var v2 = this.bound_down - v;
                var r = Math.random();
                var r1 = Math.random();
                if (r >= 0.5) {
                    this.chrom[i][pos] = v - v1 * r1 * (1 - (i / this.maxgen) * (1 - (i / this.maxgen)));
                } else {
                    this.chrom[i][pos] = v + v2 * r1 * (1 - (i / this.maxgen) * (1 - (i / this.maxgen)))
                }
            }
        },
        calculate: function () {
            // 这三行看不懂
            // time_t start,finish;
            // start = clock(); // 程序开始计时
            // srand((unsigned)time(NULL)); // 初始化随机数种子
            this.init_chrom();
            var best_fit_index_arr = this.min(this.fitness);
            console.log(best_fit_index_arr);
            var best_index = parseInt(best_fit_index_arr[0]);
            this.gbest = best_fit_index_arr[1];// 最优值
            this.gbest_index = 0;
            this.average_best[0] = this.sum(this.fitness) / this.sizepop;//初始化平均最优值

            for (var i = 0; i < this.lenchrom; i++) {
                this.gbest_pos[i] = this.chrom[best_index][i];
            }
            //进化开始
            for (var j = 0; j < this.maxgen; j++) {
                this.select(this.chrom);// 选择
                this.cross(this.chrom); // 交叉
                this.mutation(this.chrom); // 变异
                for (var k = 0; k < this.sizepop; k++) {
                    this.fitness[k] = this.activeMethod.method(this.chrom[k])
                }

                var sum_fit = this.sum(this.fitness);
                this.average_best[i + 1] = sum_fit / this.sizepop;// 平均最优值
                var arr = this.min(this.fitness);//这里可能出错 c语言源码 double new_best = *(arr+1);
                var new_best = arr[1]; // c 语言源码 :double new_best = *(arr+1);


                // 新的最优值序号,这里可能出错,c语言源码 int new_best_index = (int)(*arr);
                var new_best_index = parseInt(arr[0]);

                if (new_best < this.gbest) {
                    this.gbest = new_best;
                    for (var l = 0; l < this.lenchrom; l++) {
                        this.gbest_pos[l] = this.chrom[new_best_index][j]
                    }
                    this.gbest_index = i + 1;
                }
            }
            console.log("遗传算法次数", this.maxgen);
            console.log("最优值", this.gbest);
            console.log("最优值在第几代取得", this.gbest_index);
            console.log("此代的平均最优值", this.average_best[this.gbest_index]);
            console.log("遗传算法次数", this.maxgen);
            console.log("取得最优值的地方为", this.gbest_pos[0], this.gbest_pos[1], this.gbest_pos[2], this.gbest_pos[3], this.gbest_pos[4]);

        }
    }
})












