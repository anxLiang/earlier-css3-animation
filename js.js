// React重构

window.onload = function()
{
	inits();

	var $area = $("#content");
		areaWidth = $area.width();
		areaHeight = $area.height();

	// TODO:后续动画
	// $area.click(function()
	// {
	// 	through($(this).find(":first"), $("#secondWrap"));
	// })
	var swipe = Swipe();
	otherAanimation();

	// 用jQuery封装的Promise也应该遵循ES6 Promise使用规范，then返回一个新的Promise对象
	// 在jQuery中即Deferred对象
	var boy = Boy();
	boy.startWalk(5000, calculateX(areaWidth, 0.6), 0, 0).then(function()
	{
		swipe.scrollTo($("#content").find(":first"), -areaWidth, 7000);
	}).then(function()
	{
		return boy.startWalk(7000, calculateX(areaWidth, 0.55), 0, 0);
	}).then(function()
	{
		boy.stopWalk();
	}).then(function()
	{
		// 飞鸟
		$("#bird").addClass("changeWing");
		swipe.scrollTo($("#bird"), -areaWidth * 1.5, 7000);
		// 开门
		return doorAction(areaWidth * 0.063, false);			
	}).then(function()
	{
		return boy.startWalk(3000, calculateX(areaWidth, 0.55), -areaHeight * 0.05, 1);			
	}).then(function()
	{
		return boy.takeFlower();
	}).then(function()
	{
		return boy.startWalk(3000, calculateX(areaWidth, 0.55), areaHeight * 0.01, 2);			
	}).then(function()
	{
		// 关门
		boy.stopWalk();
		return doorAction(0, true);
	}).then(function()
	{
		swipe.scrollTo($("#content").find(":first"), -areaWidth * 2, 5000);
	}).then(function()
	{
		return boy.startWalk(5000, calculateX(areaWidth, 0.2), 0, 0);
	}).then(function()
	{
		return boy.startWalk(5000, calculateX(areaWidth, 0.32), -areaHeight * 0.11, 0);
	}).then(function()
	{
		return boy.startWalk(5000, calculateX(areaWidth, 0.43), -areaHeight * 0.11, 0);
	}).then(function()
	{
		boy.stopWalk();	
	}).then(function()
	{
		boy.boyTurnAround();
	}).then(function()
	{
		setTimeout(function()
		{				
			girlTurnAround();
		}, 1000);
		// girl开始转身，就已经开始snowflake了，因为没给girl加deferred完成标志，整个setTimeout执行完毕就进入
		// 下一个then。小bug。
	}).then(function()
	{
		snowflake(function(endPositionTop, endPositionLeft)
		{
			$("#snowflake div:last-child").css(
			{
				"top" : endPositionTop + "px",
				"left" : endPositionLeft + "px",
			}).on("transitionend", function()
			{
				$(this).remove();
			})
		});
	});


	function doorAction(dist, bool)
	{
		if (!bool) 
		{
			var dfd = $.Deferred()
			swipe.scrollTo($("#doorL"), -dist, 1000);
			swipe.scrollTo($("#doorR"), dist, 1000);
			setTimeout(function()
			{
				dfd.resolve();
			}, 1000);
			return dfd;
		}
		else
		{		
			swipe.scrollTo($("#doorL"), -dist, 1000);
			swipe.scrollTo($("#doorR"), dist, 1000);
		}
	}
}

// 初始化函数
function inits()
{
	var content = $("#content"),
		boy = $("#boyBox"),
		wrapper = content.find(":first"),
		lis = wrapper.find("li"),
		length = lis.length;

	var w = content.width(),
		h = content.height();

	var girl = $("#girl");

	lis.each(function()
	{
		$(this).css(
		{
			"width" : w + "px",
			"height" : h + "px"
		})
	});

	boy.css(
	{
		"top" : h * 0.8 - boy.height() + "px",
	});

	girl.css("top", h * 0.8 - girl.height() - h * 0.11 + "px");

	wrapper.css(
	{
		"width" : w * length + "px",
		"height" : h + "px",
	});
}

// 滑动对象工厂
function Swipe()
{
	var swipe = {};

	swipe.scrollTo = function(jqueryObj, dist, duration)
	{
		jqueryObj.css(
		{
			"transition-timing-function" : "linear",
			"transition-duration" : duration + "ms",
			"transition-property" : "transform",

			"transform" : "translateX(" + dist + "px)", 
		});

		return this; //支持链式调用
	}

	return swipe;
}

// 男孩对象工厂
function Boy()
{
	var boy = {};
	var boyElem = $("#boyBox");

	function keepWalk()
	{
		boyElem.removeClass("pauseWalk");
	}

	boy.stopWalk = function()
	{
		boyElem.addClass("pauseWalk");
	}

	boy.takeFlower = function()
	{
		var dfd = $.Deferred();
		setTimeout(function()
		{				
			boyElem.addClass("flowerStep");
			dfd.resolve();
		}, 1000);
		return dfd;
	}

	boy.boyTurnAround = function()
	{
		keepWalk();
		boyElem.removeClass("changeStep");
		boyElem.removeClass("flowerStep");
		boyElem.addClass("boy-turnAround");
	}

	function initTransition()
	{
		boyElem.addClass("changeStep");
		boyElem.css(
		{
			"transition-timing-function" : "linear",
			"transition-property" : "all",
		});
	}

	boy.startWalk = function(duration, distX, distY, num)
	{
		var dfd = $.Deferred();

		keepWalk();

		// TODO 合理封装
		if (num == 1)
		{			
			boyElem.css(
			{
				"transition-duration" : duration + "ms",
	
				// 一次性设置多个transform值，需要在同一条语句中写，否则会被最后一条语句覆盖
				// css3同一时间只能执行一个过渡动画
				"transform" : "translate3d(" + distX + "px," + distY + "px,0px) scale(0.6,0.6)",
				"opacity" : 0,
			});
		}
		else if (num == 2)
		{
			boyElem.css(
			{
				"transition-duration" : duration + "ms",
	
				// 一次性设置多个transform值，需要在同一条语句中写，否则会被最后一条语句覆盖
				// css3同一时间只能执行一个过渡动画
				"transform" : "translate3d(" + distX + "px," + distY + "px,0px) scale(1,1)",
				"opacity" : 1,
			});
		}
		else
		{
			boyElem.css(
			{
				"transition-duration" : duration + "ms",
	
				// 一次性设置多个transform值，需要在同一条语句中写，否则会被最后一条语句覆盖
				// css3同一时间只能执行一个过渡动画
				"transform" : "translate3d(" + distX + "px," + distY + "px,0px)",
			});
		}

		// transitionend事件，监听过渡动画完成，同理有animationend,Hack写法为webkitTransitionEnd。
		// 该事件会冒泡，需要合理阻止
		boyElem.get(0).addEventListener("transitionend",function(e)
		{
			e = e || window.event;
			e.stopPropagation();
			dfd.resolve();			
		})
		return dfd;
	}

	initTransition();
	return boy;
}

// 目标值计算
function calculateX(areaWidth, proportion)
{
	return areaWidth * proportion;
}

// 杂项动画
function otherAanimation()
{
	var $sun = $("#sun"),
		$clouds = $(".cloud");

	$sun.addClass("sunAnimation");
	$clouds.each(function(index)
	{
		$(this).addClass("cloud" + (index + 1) + "Animation");
	})
}

function girlTurnAround()
{
	var girl = $("#girl");
	girl.addClass("girl-turnAround");
}

///////
//飘雪花 //
///////
var timer = null;

function snowflake(fn) 
{
    // 雪花容器
    var $flakeContainer = $('#snowflake'); 
    var snowflakeURl = 
    [
    	"img/snowflake/snowflake1.png",
    	"img/snowflake/snowflake2.png",
    	"img/snowflake/snowflake3.png",
    	"img/snowflake/snowflake4.png",
    	"img/snowflake/snowflake5.png",
    	"img/snowflake/snowflake6.png"
    ];

    // 随机六张图
    function getImagesName() 
    {
        return snowflakeURl[Math.floor(Math.random() * 6)];
    }
    // 创建一个雪花元素
    function createSnowBox() 
    {
        var url = getImagesName();
        return $('<div class="snowbox" />').css("backgroundImage", "url(" + url + ")");
    }
    // 开始飘花
    timer = setInterval(function() 
    {
        // 运动的轨迹
        var visualWidth = $("#content").width(),
        	visualHeight =  $("#content").height();
        var startPositionLeft = Math.random() * visualWidth,
            startOpacity    = 1,
            endPositionTop  = visualHeight + 50,
            endPositionLeft = visualWidth * Math.random();

         //////////////////////////////////////////////////////////
         // 用js生成的新元素只保存在内存中，如果还没加入到页面上就给新元素加入过渡动画，改变属性过渡动画不会起作用 //
         // 因为当元素未加入到页面中时，任何改变都只发生在内存中，不是元素的最终状态。                //
         // 过渡动画需要改变的是元素的最终状态，即添加到DOM中再对其做改变。                    //
         //////////////////////////////////////////////////////////
         if (fn)
         {
         	fn(endPositionTop, endPositionLeft);
         }

        // 随机透明度，不小于0.5
        var randomStart = Math.random();
        randomStart = randomStart < 0.5 ? startOpacity : randomStart;
        // 创建一个雪花
        var $flake = createSnowBox();
        // 设计起点位置
        $flake.css(
        {
            'left': startPositionLeft + 'px',
            'opacity' : randomStart,
        });
        
        // 加入到容器
        $flakeContainer.append($flake);
    }, 200);
}



function through(jqueryObj1, jqueryObj2)
{
	// jqueryObj1.css(
	// {
	// 	"perspective" : "200px",
	// 	"perspective-origin" : "50% 50%",
	// });

	// jqueryObj1.css(
	// {
	// 	"transition-property" : "all",
	// 	"transition-duration" : "1.5s",
	// 	"transition-timing-function" : "ease-in",
	// });

	// jqueryObj1.css(
	// {
	// 	// "opacity" : 0,
	// 	"transform" : "translate3d(0px,0px,-700px)",
	// });

	// jqueryObj1.on("transitionend", function()
	// {
	// 	$(this).css("display", "none");
	// 	jqueryObj2.css("display", "block");
	// });
}