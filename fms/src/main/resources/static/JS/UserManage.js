///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//全局变量
var pageSize = 20;              //一页最多显示16条信息
var jData = [];
var searchType = '';
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//#region 展示表格  
function displayTable(data){
    $('tbody').empty();
    $('#paginationUserInfoList').jqPaginator({
        first: '<li class="first"><a href="javascript:;">首页</a></li>',
        prev: '<li class="prev"><a href="javascript:;"><<</a></li>',
        next: '<li class="next"><a href="javascript:;">>></a></li>',
        last: '<li class="last"><a href="javascript:;">末页</a></li>',
        page: '<li class="page"><a href="javascript:;">{{page}}</a></li>',
        totalPages: Math.ceil(data.length / pageSize),
        totalCounts: data.length,
        pageSize: pageSize,
        onPageChange: function(num){
            var begin = (num - 1) * pageSize;
            for(var i = begin; i < data.length && i < begin + pageSize; i++){
                $('tbody').append('<tr><td>' + data[i]['jobNumber']
                + '</td><td>' + data[i]['userName']
                + '</td><td>' + data[i]['mailAddress']
                + '</td><td>' + data[i]['authority']
                + '</td><td>' + data[i]['department']
                + '</td><td>' + data[i]['loginTime']
                + '</td><td><button class="btn act-btn" onclick="showEditModal(this);">修改</button>'
                + '<button class="btn act-btn" onclick="delUser(this);">删除</button>'
                + '</td></tr>');
            }
        }
    });
}
function refleshTable(){
    $('tbody').empty();
    $.ajax({
        type: "GET",
        dataType: "JSON",
     //   url: "../TestData/UserInfoList.json",
        url: "/queryUser",
        success: function(result){
            debugger;
            displayTable(result.data);
            jData = result.data;
        },
        error: function(){
            alert('获取信息失败，请稍后刷新重试...');
        }
    });
}
$(window).on('load', refleshTable());
//#endregion

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//#region 查找
    function chooseSearchType(e){
        $('#searchTypeBtn').text($(e).text());
        searchType = $(e).text();
        $('#paramInput').focus();
    }

    $('#searchBtn').click(function(){
        debugger;
        var param = $('#paramInput').val();
        switch(searchType){
            case '工号':
                displayTable(jData.filter(function(item) { return item.jobNumber == param}));
                break;
            case '姓名':
                displayTable(jData.filter(function(item)  { return item.userName == param}));
                break;
            case '权限':
                displayTable(jData.filter(function(item)  { return item.authority == param}));
                break;
            case '工作部门':
                displayTable(jData.filter(function(item)  { return item.department == param}));
                break;
            default:
                $('#paramInput').val('');
                displayTable(jData);
        }
    });
//#endregion

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//#region 修改用户信息
function showEditModal(e){
    $('#UserID').val($(e).parent().parent().children().eq(0).text());
    $('#NewPrivilege').val($(e).parent().parent().children().eq(3).text());

    $('#editModal').modal('show');
}
$('#EditBtn').click(function(){
   /* var transData = {
        'UserID': $('#UserID').val(),
        'NewPrivilege': $('#NewPrivilege').val()
    };*/
 //lert($('#NewPrivilege').val());
    debugger;
     $.ajax({

        type: 'get',
        dataType: 'JSON',
        contentType: 'application/json',
      //  data: transData,
        url: '/updateAuthority?jobNumber='+$('#UserID').val()+"&authority="+$('#NewPrivilege').val(),               //待填
        success: function(result){
            if(result.resultCode==0){
                alert('修改成功！');
                $('#editModal').modal('hide');
                refleshTable();
            }else{
                alert('修改失败，请稍后重试...');
            }
        },
        error: function(){
            alert('修改失败，请稍后重试...')
        }
    });
});
//#endregion

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//#region 删除用户信息
function delUser(e){
    var userID = $(e).parent().parent().children().eq(0).text();
    if(confirm('是否需要删除工号为' + userID + '用户？')){
         $.ajax({
            type: 'get',
            dataType: 'JSON',
            url: '/deleteUser?jobNumber='+userID,               //待填  ?UserID=userID
            success: function(result){
                debugger;
                if(result.resultCode == 0){
                    alert('删除成功！');
                    refleshTable();
                }else{
                    alert('删除失败，请稍后重试...');
                }
            },
            error: function(){
                alert('删除失败，请稍后重试...')
            }
        });
    }
}
//#endregion

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//#region 添加用户
$('#showAddModalBtn').click(function(){
    $('#addModal').modal('show');
});
$('#AddBtn').click(function(){
    if ($('#NewUserUserID').val() == "" || $('#NewUserUserID').val() == null) {
        $('#tip1').text("工号不能为空");
        $('#tip1').css('display', 'block');
        return;
    }
    if ($('#NewUserName').val() == "" || $('#NewUserName').val() == null) {
        $('#tip1').text("姓名不能为空");
        $('#tip1').css('display', 'block');
        return;
    }
    if ($('#mailAddress').val() == "" || $('#mailAddress').val() == null) {
        $('#tip1').text("邮箱不能为空");
        $('#tip1').css('display', 'block');
        return;
    }
    if ($('#department').val() == "" || $('#department').val() == null) {
        $('#tip1').text("部门不能为空");
        $('#tip1').css('display', 'block');
        return;
    }
    $('#tip1').css('display', 'none');
    var transData = {
        'jobNumber': $('#NewUserUserID').val(),
        'userName': $('#NewUserName').val(),
        'password': $('#pwd').val(),
        'mailAddress': $('#mailAddress').val(),
        'department': $('#department').val(),
        'authority': $('#NewUserPrivilege').val()
    };
     $.ajax({
        type: 'POST',
        dataType: 'JSON',
        contentType: 'application/json',
        data:  JSON.stringify(transData),
        url: '/doRegister',                      //待填
        success: function(result){
            if(result.resultCode == 0){
                alert('添加成功！');
                refleshTable();
                $('#addModal').modal('hide');
            }else{
                alert('添加失败，请稍后重试...');
            }
        },
        error: function(){
            alert('添加失败，请稍后重试...')
        }
    });
});
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