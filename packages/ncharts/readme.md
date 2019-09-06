# nchart
[TOC]
## 备注
1. [tip]mode factory的返回，比起x/y是不是value/category更明确，因为涉及文件多暂且备注
2. global.data.sorter?global.sort?:global.sort没有用到
3. dataIndex?还有sourceIdx、groupIdx的定义
4. 一份数据每个serie取一个key和多份数据每个serie取1个，怎么用
5. 有时间把enriches里的整理出来

## Directory Structure
**以bar为例结构遍历**
<pre>
|-- ncharts
    |-- ChartContainer.tsx 入口组件
    |-- IChartDataFactory.ts chart data factory接口定义，eg.SingleDataFactory
    |-- ICharts.ts 大部分数据结构接口定义
    |-- IEnrichSerie.ts 附加功能实现类的接口定义
    |-- IFactory.ts 各类型图基础类的接口，eg. AbstractBar
    |-- ISerieHandle.ts 各类型图的series处理factory接口定义，eg.BarSerieFactory
    |-- config
    |	|-- config.ts 常量定义
    |-- bar 柱状图
    |   |-- AbstractBar.ts 柱状图的基类，包含初始化入口和默认option配置
    |   |-- Bar.ts 普通柱状图用户option处理类，扩展自AbstractBar
    |   |-- BarSerieFactory.ts bar类型的单个系列(seire)处理类
    |-- boxplot 盒须图
    |   |-- AbstractBoxplot.ts
    |   |-- Boxplot.ts
    |-- enriches
    |   |-- AvgMarkLine.ts 平均值虚线功能
    |   |-- DataZoom.ts 横轴滚动datazoom[具体内容暂略]
    |   |-- MultiBarMarkLine.ts 连线[具体内容暂略]
    |-- factories
    |   |-- ChartFactory.ts 根据props.type获取对应的factory处理options并返回
    |   |-- DataFactory.ts 数据处理类，根据props.options.global.dateType获取
    |   |-- EnrichFactory.ts 获取对应的enrich factory处理数据
    |   |-- bar
    |   |   |-- MultiDataFactory.ts 多系列展开，梯队图这样把历次考试展开合成一个category，目前会附加分组间隔
    |   |   |-- MultiShallowDataFactory.ts 多系列堆叠，优良等第这种单次考试把二层结构最外层做系列，内层取值
    |   |   |-- SingleDataFactory.ts 单系列chart处理
    |	|	|-- RectDataFactory.ts custom自定义上下限柱状图
    |   |-- mode
    |   |   |-- ModeFactory.ts 根据props.options.mode获取category/value轴方向
    |   |-- serie
    |       |-- SerieFactory.ts 根据chart类型得到series处理类
    |-- line 线
    |   |-- AbstractLine.ts
    |   |-- Lineutil
        |-- Ary.ts 数组辅助处理，包括排序和取值
        |-- Data.ts 数据辅助处理类，主要为设值取值功能
        |-- Dom.ts resize监听辅助
        |-- LabelHandle.ts category轴文本处理类，目前只有文本切割
        |-- List.ts 数组辅助处理[name方面？]
        |-- ResizeObserve.ts observe形式resize监听器
        |-- Type.ts 类型判断辅助类
</pre>

## 参数说明
## Props
#### width
容器宽度，支持数字或"400px"形式字符串
* Type: `string` | `number`
* Default: `undefined`

#### height
容器高度，支持数字或"400px"形式字符串
* Type: `string` | `number`
* Default: `400px`

#### wrapperSlick
是否被slick包裹，为true时添加额外的监听器
* Type: `boolean`
* Default: `false`

#### theme
注册的echarts主题名字，会用这个主题去初始化
* Type: `string`
* Default:

#### options
数据、配置参数
* Type: `{global,option,mode}`
* Default: `{}`

## Props.options
#### mode
chart方向，默认vertical为x轴category,y轴value，horizontal相反
* Type: `horizontal`|`vertical`
* Default: `vertical`

#### global
自定义的部分处理参数
* Type: `{source,sort,enriches,series,events}`
* Default: `{}`

#### option
echarts参数，可以加部分自定义参数交由ncharts处理
* Type: `Object`
* Default: `{}`

## Props.options.global
#### events
需要监听的事件和函数，会调用`echartsInstance.on()`注册事件，详见[echarts echartsInstance.on](https://www.echartsjs.com/api.html#echartsInstance.on)
* Type: `{type,handle}[]`
* Default: `[]`
1. events[].type: `string`，需要监听的事件名称
2. events[].handle: `Function` 处理函数

#### dateType
数据处理类型，根据这个字段获取data factory
* Type: `single | multi | multi_shallow`
* Default: `undefined`

#### source
数据源配置，从中获得数据源
* Type:`Function | any[] | { data, key,sorter }`
* Default:
1. data: `any[]` 原始数据
2. key: `string | string[]` 键值，对于单系列是string,多系列是string[]
3. sorter: `Object`  
	sorter.sort: `number` 排序方向，>0正序，<0倒序  
    sorter.key: `string` 当前排序value  
    sorter.keys: `{value,sortKey}[]` 排序配置，sortKey为实际字段名，value为对应的选择值  

#### label
category轴label相关配置，目前只有文字切割配置
* Type: `{cutname,cutlength}`
* Default: `{}`
1. cutname: `boolean` 是否切割名字，默认`false`
2. maxLength: `number` 切割长度，默认18个字符[中文字符占2个长度]

#### sort
暂时没看到用的地方

#### series
multil,multi_shallow型数据时必要，扩充series需要，定义series数量；  
获取系列名字集合(name)用，如果没有legend，legend.data也会取这个值
* Type: `(sources)=>any[]` 直接调用,sources是前几步生成的数据源
* Type: `any[]` 直接返回数组
* Type: `{ key, suffix }`
	+ key
		+ Type: `string`
		+ 取系列值用的字段，可以用点隔开做到从嵌套数组中取值，目前sourceIdx和levelIdx没有传入都是默认0
	+ suffix
		+ Type: `string`
		+ 对于sources>1的multi类型，需要在取值的时候拼接在后面的字段，会用空格隔开
    + initSelected
        + Type: `number[]`
        + 初始选择的系列
    + names
        + Type: `string[]`
        + 对应rect，维度名字定义，会存放到每个series中，没有定义维度在encode自定义顺序时会有概率发生取值错误(按目前的结构)
    + 返回结构string[] | {name,seriesIndex,icon,...}[]
        + seriesIndex:指定模板序号，没有取0或当前index的


#### enriches
* Type: `{name,key,data,top,...res}[]`
* Default: `{}`
    + ##### key
        * enrich类的标识
        * Type: `avgLine | multiBarMarkLine | dataZoom`
        * Default:

    ### **avgMarkLine**
    设置markLine配置到series[0]中
    + ##### data
        * 数据取值，markLine.data.xAxis/yAxis
    	* Type: `Function | {data,key} | any[]`
    + ##### markLine
        * markLine的echarts配置
        * Type: `Object`
        * Default:
        ````javascript
        lineStyle: {
            normal: {
                color: ["#169FF4"],
                type: "dashed"
            }
        }
        ````

    ### **datazoom**
    + ##### data
        * 是否进行datazoom处理，默认进行处理
        * Type: `boolean`
        * Default: `true`
    + ##### axisIndex
        * 对于多category轴时，指定哪个轴用于计算
        * Type: `number`
        * Default: `0`
    
    ### **legendReorder**
    是否对legend重新调整顺序，对配置数组会按顺序进行操作
    + ##### reorder
        * Type: `((legendItem, index) => any)|{type:string,inds:number[]}[]`
        * Default: `undefined`
        * type: "suffix"后置，"preifx"前置,"reverse"反转
        * inds:需要后置、前置的序号集合

    ### **tooltipNewline**
    tooltip换行配置
    + ##### maxlen `number` 最大行数，对于多维数组，会取成组的整数值
    + ##### styles `string[]` 额外的单项样式

## Props.options.option
#### (category)xAxis/yAxis([]).data
category轴的数据，可以经由ncharts处理
如果是函数，会传入source，如果为`{key}`，会从sources中取对应字段，如果是正常的数组不做处理
* Type: `(sources)=>any[] | {key} | any[]`
* Default:

#### series[].encode
* Type: `Object | string[] | number[]`
* 参照echart文档，可以用序号或者维度名字
* 允许用**axis**表示value轴由echart判断x轴还是y轴
* 建议自定义好tooltip、label值

#### series[].data
* Type: `()=>any[] | {enrich?,callback?,keys,key,data} | any[]`
    + ##### enrich
        * 对取出的数据进一步处理，传入当前数据，序号，series序号，dataIndex?
        * Type: `(v,ind,levelIdx,dataIndex)=>any`
        * Default: `undefined`
    + ##### callback
        * 获取serie回调，source数据源，levelIdx序号,dataIndex?
        * Type: `(sources, levelIdx, dataIndex)=>any[]`
        * Default: `undefined`
    + ##### keys
        * 取值数组
        * Type: `{dataKey,value}[]`
        * Default: `[]`
    + ##### data
        * 取值用数据源
        * Type: `Object | any[]`
        * Default: `undefined`
    + ##### key
        * 当前value，在multi_shallow中也用于从sources中取数组用于value取值，此时固定取第一个series的
        * Type: `string`
        * Default: `undefined`
    + #### value
        * 从数组中取值的字段，multi_shallow后面添加levelIdx取值，优先本身，其次levelIdx
    	* Type: `any`
    	* Default:`undefined`

#### series[].label.formatter
可以覆盖默认的formatter格式  
**备注：视版本而定label.formatter形式echart不一定能识别**  
**3.x使用label:{normal,emphasis}形式，4.x使用label:{},emphasis:{label}形式，4.x兼容3.x写法，itemStyle同理**
* Type: `Object`
	+ ##### callback
		* Type: `Function`
	+ ##### currie
		* 为true时，调用callback，传入serie.data,数据源sources,dataIndex，为false时把callback赋值给formatter
        * Type: `boolean`
        * Default: `false`

#### legend
* Type: `Function` 传入数据源，获取legend.data，也可以设置在global.series中
* Type: `Array` 赋值给legend.data
* Type: `{key,suffix, initSelected}`
	+ ##### key
		* 取值字段,会拼接成sources[0][key]，多data的二维数组有效
    	* Type: `string`
    + ##### suffix
    	* 后缀，取suffix字段拼接在后面
    	* Type: `string`
    + ##### initSelected
        * 初始处于selected状态的系列，序号数组
        * Type: `number[]`
        * Default: `undefined`
