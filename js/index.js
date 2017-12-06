var app = new Vue({
    el: '#main',
    data: {
        methodList: [
            {
                name: '目标函数名字1',
                isActive: true,
                method: function (arr) {
                    var firstXResult = 0;
                    var secondXResult = 0;
                    arr.forEach(function (item, index) {
                        if(index === 1 ){
                            firstXResult = -5 * Math.sin(item);
                            return;
                        }
                        firstXResult = firstXResult * Math.sin(item);
                        console.log(firstXResult)
                    })
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
    mounted:function () {

    },
    methods: {
        getActiveMethod: function (item) {
            this.activeMethod = item;
            this.methodList.forEach(function (t) {
                t.isActive = false
            });
            item.isActive = true;
        },
        calculate: function () {
            alert('开始计算')
        }
    }
})