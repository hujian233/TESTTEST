////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//定义全局变量
var initData = {};
var displayType = 'Out';                //当前展示的申请类型
var searchType = '';                    //搜索类型
var selectedToolModel = [];             //已选择的夹具实体

var canshu = window.location.search.substr(10);
/*var mark = canshu.indexOf("&");
var userName = canshu.substring(0, mark);
userName = decodeURIComponent(userName);
$("#name").html(userName + " 欢迎");*/

var idindex=find(canshu,'=',2);
var id=decodeURIComponent(canshu.substring(idindex+1));

function find(str,cha,num){
    var x=str.indexOf(cha);
    for(var i=0;i<num;i++){
        x=str.indexOf(cha,x+1);
    }
    return x;
}
refreshTable();
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//#region 获取待提交申请列表、刷新待申请列表（函数）
function refreshTable(){
    var type = 0;
    //待采购入库，为新加状态
    if (displayType == 'purchaseIn') {
        type = 1;
    }
    if (displayType == 'Out') {
        type = 3;
    }
    if (displayType == 'In') {
        type = 2;
    }
    if (displayType == 'Repair') {
        type = 4;
    }
    if (displayType == 'Scrap') {
        type = 5;
    }
    $.ajax({
        type: 'GET',
        dataType: 'JSON',
        // url: '../TestData/TempApplicationList.json',  //后端Url，附加code参数
        url:'/fixture/querywaitsubmit?type='+type,
        success: function(result){
            initData = result;
            debugger;
            /*
                        $('#Workcell').val(initData['Workcell']);        //将申请人信息绑定至申请单
                        $('#ApplicantID').val(initData['ApplicantID']);
                        $('#ApplicantName').val(initData['ApplicantName']);

                        displayTable(initData[displayType]);*/
            //TODO将用户信息查询出来绑定至申请单
           // getUser();
            displayTable(initData);
        },
        error: function(){
            alert('获取信息失败，请稍后重试...');
        }
    });
}


//根据jobnumber查询user信息
function getUser(){
    $.ajax({
        type: 'GET',
        dataType: 'JSON',
        url:'/queryUser?jobNumber='+id,
        success: function(result){
            debugger;
            $('#Workcell').val(result.data[0].department);//工作部门
            $('#ApplicantID').val(result.data[0].jobNumber);
            $('#ApplicantName').val(result.data[0].userName);
        },
        error: function(){
           // alert('获取信息失败，请稍后重试...');
        }
    });
}

function displayTable(data){
    $('tbody').empty();
    for(let i = 0; i < data.length; i++){
        $('tbody').append(
            '<tr><td><input class="checkbox" onchange="selectOne(this);" type="checkbox">'
            + '</td><td>' + data[i].code
            + '</td><td>' + data[i].seqId
            + '</td><td>' + data[i].name
            + '</td><td><i class="glyphicon glyphicon-remove remove-icon" onclick="remove(this);"></i></td></tr>');
    }
}

/*$(window).on('load', function(){
    refreshTable();
    $.ajax({                //获取故障类型与产线的字典
        type: 'GET',
        dataType: 'JSON',
        url: '../TestData/LinePMDict.json',  //后端Url，附加code参数
        success: function(result){
            for(let p in result['Line']){            //将产线、故障字典绑定至下拉框
                $('#LineID').append('<option value="'
                    + p + '">' + result['Line'][p] + '</option>');
            }
            for(let p in result['PMContent']){
                $('#PMContentID').append('<option value="'
                    + p + '">' + result['PMContent'][p] + '</option>');
            }
        },
        error: function(){
            alert('获取信息失败，请稍后重试...');
        }
    });
});*/
//#endregion

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//#region 切换展示的申请类型
function changeTab(e, type){
    $('#' + displayType + 'Tab').removeClass('a-tab-active');
    $(e).addClass('a-tab-active');
    $('#selectAll').prop('checked', false);
    displayType = type;
    //切换tab的时候查询一下
    refreshTable();
    // displayTable(initData[displayType]);
}
//#endregion

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//#region checkbox
$('#selectAll').change(function(){
    if($(this).prop('checked')){
        for(let i = 0; i < $('tbody').children().length; i++){
            $('tbody').children().eq(i).children().eq(0).children().eq(0).prop('checked', true);
            $('tbody').children().eq(i).addClass('tr-selected');
        }
    }else{
        for(let i = 0; i < $('tbody').children().length; i++){
            $('tbody').children().eq(i).children().eq(0).children().eq(0).prop('checked', false);
            $('tbody').children().eq(i).removeClass('tr-selected');
        }
    }
})
function selectOne(e){
    if(!$(e).prop('checked')){
        $(e).prop('checked', false);
        $(e).parent().parent().removeClass('tr-selected');
    }else{
        $(e).prop('checked', true);
        $(e).parent().parent().addClass('tr-selected');
    }
}
//#endregion

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//#region 删除按钮
function remove(e){
    var code = $(e).parent().parent().children().eq(1).text();
    var seqID = $(e).parent().parent().children().eq(2).text();
    var transData = [];
    transData.push({'Code': code, 'SeqID': seqID, 'Type': displayType});
     $.ajax({
        type: 'get',
        dataType: 'JSON',
        contentType: 'application/json;charset=UTF-8',
       // data: JSON.stringify(transData),
       // url: '',  //待改  后端接口
         url: '/fixture/deletewaitsubmit?code=' + code + "&seqId=" + seqID,
         success: function(result){
            if(result.Status == 'error'){
                alert('操作失败，请稍后重试...');
            }else{
                alert("删除成功");
                refreshTable();
            }

        }
    });
    //displayTable(initData[displayType]);
}
//#endregion

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//#region 查找
function chooseSearchType(e, type){
    debugger;
    $('#searchTypeBtn').text($(e).text());
    searchType = type;
    $('#paramInput').focus();
}

$('#searchBtn').click(function(){
    var param = $('#paramInput').val();
    switch(searchType){
        case 'Code':
            displayTable(initData.filter(function(item) { return item.code == param}));
            break;
        case 'Name':
            displayTable(initData.filter(function(item){ return item.name == param}));
            break;
        default:
            $('#paramInput').val('');
            displayTable(initData);
    }
});
//#endregion

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//#region 填写申请单
function showFillInModal(){
    //获取用户信息绑定申请表
    getUser();
    selectedToolModel = [];
    var selectedCount = 0;        //选中夹具数
    for(let i = 0; i < $('tbody').children().length; i++){    //将选中的夹具添加入变量数组
        if($('tbody').children().eq(i).children().eq(0).children().eq(0).prop('checked')){
            selectedToolModel.push({
                'Code': $('tbody').children().eq(i).children().eq(1).text(),
                'SeqID': $('tbody').children().eq(i).children().eq(2).text()
            });
            selectedCount++;
        }
    }
    if(selectedCount == 0){
        alert('您当前还未选择任何夹具！');
        return;
    }
    $('#outInput').hide();
    $('#inInput').hide();
    $('#repairInput').hide();
    $('#scrapInput').hide();
    switch(displayType){                         //更改模态窗内容
        case 'Out':
            $('#modalTitle').text('填写出库申请单');
            $('#UserName').val('');
            $('#LineID').val('');
            $('#Check').prop('checked', false);
            $('#OutRemarks').val('');
            $('#outInput').show();
            break;
        case 'In':
            $('#modalTitle').text('填写入库申请单');
            $('#InRemarks').val('');
            $('#inInput').show();
            break;
        case 'Repair':
            $('#modalTitle').text('填写报修申请单');
            $('#PMContentID').val('');
            $('#RepairReason').val('');
            $('#repairInput').show();
            break;
        case 'Scrap':
            $('#modalTitle').text('填写报废申请单');
            $('#ScrapReason').val('');
            $('#scrapInput').show();
            break;
        case 'purchaseIn':
            $('#modalTitle').text('填写待采购入库申请单');
            $('#puchaseInRemarks').val('');
            $('#purchaseinInput').show();
            break;
    }

    $('#selectedModelTextarea').text('');                       //清空富文本框显示夹具
    for(let i = 0; i < selectedToolModel.length; i++){          //刷新富文本框显示夹具
        let temp = $('#selectedModelTextarea').text();
        $('#selectedModelTextarea').text(temp + 'No.' + (i + 1) + '    '
            + selectedToolModel[i].Code + '    '
            + selectedToolModel[i].SeqID + '\n');
    }

    $('#fillInModal').modal('show');
}

$('#SubmitBtn').click(function(){               //提交申请单
   /* var transData = {
        'ToolModel': selectedToolModel,
        'Workcell': $("#Workcell").val(),
        'ApplicantID': $("#ApplicantID").val(),
        'ApplicantName': $("#ApplicantName").val()
    };*/
    var transData = {};
    switch(displayType){
        case 'Out':
           /* transData['UserName'] = $('#UserName').val();
            transData['LineID'] = $('#LineID').val();
            transData['Check'] = $('#Check').prop('checked');
            transData['Remarks'] = $('#OutRemarks').val();*/
            var applicant=$('#ApplicantID').val()+" "+$('#ApplicantName').val();
            transData['applicant'] = applicant;
            var selectedJiaju=[];
            debugger;
            for(var i=0;i<selectedToolModel.length;i++){
                var object={};
                object.code=selectedToolModel[i].Code;
                object.seqId=selectedToolModel[i].SeqID;
                selectedJiaju.push(object);
            }
            debugger;
            //夹具
            transData['codeListVo'] =selectedJiaju;
            //备注
            transData['note'] = $('#OutRemarks').val();
            //领用人姓名
            transData['employer']=$('#UserName').val();
            //产线
            transData['proLine']=$('#LineID').val();
            //是否为点检
            var check=$("#checkbox").is(':checked');
            if(check==true){
                transData['ifCheck']=true;
            }else{
                transData['ifCheck']=false;
            }

            //
            SubmitByAjax(transData, '/do/outbound');
            break;
        case 'In':
            //applicant:工号+姓名  note:备注
            var applicant=$('#ApplicantID').val()+" "+$('#ApplicantName').val();
            transData['applicant'] = applicant;
            transData['note'] = $('#InRemarks').val();
            var selectedJiaju=[];
            debugger;
            for(var i=0;i<selectedToolModel.length;i++){
                var object={};
                object.code=selectedToolModel[i].Code;
                object.seqId=selectedToolModel[i].SeqID;
                selectedJiaju.push(object);
            }
            transData['codeListVo'] =selectedJiaju;
            SubmitByAjax(transData, '/do/inbound');
            break;
        case 'Repair':
            //故障类别
            transData['failureType'] = $('#PMContentID').val();
            //故障描述
            transData['failureDesc'] = $('#RepairReason').val();
            //applicant:工号+姓名  note:备注
            var applicant=$('#ApplicantID').val()+" "+$('#ApplicantName').val();
            transData['applicant'] = applicant;
            var selectedJiaju=[];
            debugger;
            for(var i=0;i<selectedToolModel.length;i++){
                var object={};
                object.code=selectedToolModel[i].Code;
                object.seqId=selectedToolModel[i].SeqID;
                selectedJiaju.push(object);
            }
            transData['codeListVo'] =selectedJiaju;
            SubmitByAjax(transData, '/do/repair');
            break;
        case 'Scrap':
            //报废原因
            transData['reason'] = $('#ScrapReason').val();
            //applicant:工号+姓名  note:备注
            var applicant=$('#ApplicantID').val()+" "+$('#ApplicantName').val();
            transData['applicant'] = applicant;
            var selectedJiaju=[];
            debugger;
            for(var i=0;i<selectedToolModel.length;i++){
                var object={};
                object.code=selectedToolModel[i].Code;
                object.seqId=selectedToolModel[i].SeqID;
                selectedJiaju.push(object);
            }
            transData['codeListVo'] =selectedJiaju;
            SubmitByAjax(transData, '/do/scrapped');
            break;
        case 'purchaseIn':
            transData['Reason'] = $('#puchaseInRemarks').val();
            //todo 后台逻辑还没写好
           // SubmitByAjax(transData, '/do/purchase');
            break;
    }
});

function SubmitByAjax(data, url){
    $.ajax({
        type: 'POST',
        dataType: 'JSON',
        contentType: 'application/json;charset=UTF-8',
        data: JSON.stringify(data),
        url: url,
        success: function(result){
            if(result.Status == 'error'){
                alert('提交失败，请稍后重试...');
            }else{
                alert('提交成功！');
                //关闭小窗
                $('#fillInModal').modal('hide');
                refreshTable();
            }
        }
    });
}
//#endregion

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//#region 回到顶部悬浮按钮
$(window).on('load', function(){
    // 获取页面可视区域的高度
    var clientHeight = document.documentElement.clientHeight;
    var timer = null;// 定义定时器变量
    var isTop = true;// 是否返回顶部
    // 滚动滚动条时候触发
    $(window).on('scroll', function(){
        // 获取滚动条到顶部高度-返回顶部显示或者隐藏
        var osTop = document.documentElement.scrollTop || document.body.scrollTop;
        if (osTop >= clientHeight / 3) {
            $('#danglingBack').show();
        } else {
            $('#danglingBack').hide();
        }
        // 如果是用户触发滚动条就取消定时器
        if (!isTop) {
            clearInterval(timer);
        }
        isTop = false;
    });
    // 返回顶部按钮点击事件
    $('#danglingBack').click(function(){
        timer = setInterval(function() {
            // 获取滚动条到顶部高度
            var osTop = document.documentElement.scrollTop || document.body.scrollTop;
            var distance = Math.floor(-osTop / 6);
            document.documentElement.scrollTop = document.body.scrollTop = osTop + distance;
            isTop = true;
            if (osTop == 0) {
                clearInterval(timer);
            }
        }, 30);
    });
})
//#endregion