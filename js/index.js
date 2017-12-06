var app = new Vue({
    el: '#main',
    data: {
        methodList: [
            {
                name: '函数名字1',
                isActive: true,
                method: function () {
                    return 1
                }
            },
            {
                name: '函数名字2',
                isActive: false,
                method: function () {
                    return 2
                }
            }
        ],
        activeMethod: {},
        paramList :[
            {name:'参数名字1',value:0},
            {name:'参数名字2',value:0},
            {name:'参数名字3',value:0}
        ]
    },
    methods: {
        getActiveMethod: function (item) {
            this.activeMethod = item;
            this.methodList.forEach(function (t) {
                t.isActive = false
            });
            item.isActive = true;
        },
        calculate:function () {
            alert('开始计算')
        }
    }
})