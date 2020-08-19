// parallax effect for images
$(window).scroll(function () {
	parallax();
	navbar();
});
//password checker anony func
$(document).ready(function () {
	//validation for forms
	$("#password").keyup(
		function () {
			let pswd = $(this).val();

			if (pswd.length >= 8) {
				$("#length").removeClass("invalid").addClass("valid");
				$("#length>span").removeClass("fa-times").addClass("fa-check");
			} else {
				$("#length").addClass("invalid").removeClass("valid");
				$("#length>span").addClass("fa-times").removeClass("fa-check");
			}
			if (pswd.match(/[A-z]/)) {
				$("#letter").removeClass("invalid").addClass("valid");
				$("#letter>span").removeClass("fa-times").addClass("fa-check");
			} else {
				$("#letter").addClass("invalid").removeClass("valid");
				$("#letter>span").addClass("fa-times").removeClass("fa-check");
			}
			if (pswd.match(/[A-Z]/)) {
				$("#capital").removeClass("invalid").addClass("valid");
				$("#capital>span").removeClass("fa-times").addClass("fa-check");
			} else {
				$("#capital").addClass("invalid").removeClass("valid");
				$("#capital>span").addClass("fa-times").removeClass("fa-check");
			}
			if (pswd.match(/\d/)) {
				$("#number").removeClass("invalid").addClass("valid");
				$("#number>span").removeClass("fa-times").addClass("fa-check");
			} else {
				$("#number").addClass("invalid").removeClass("valid");
				$("#number>span").addClass("fa-times").removeClass("fa-check");
			}
		}
	).focus(
		function () {
			$("#pswd_info").show();

		}
	).blur(
		function () {
			$("#pswd_info").hide();
		}
	);
	//password checker
	$("#confirm-password").keyup(
		function () {
			let pass = $("#password").val();
			let cnfrmpass = $("#confirm-password").val();
			if (pass === cnfrmpass) {
				$("#passerr").addClass("text-success").removeClass("text-danger");
				$("#passerr small").text("passwords match");
				$("#passerr span").addClass("fa-check").removeClass("fa-exclamation");
				$("#passerr").show();
			} else {
				$("#passerr").removeClass("text-success").addClass("text-danger");
				$("#passerr small").text("passwords do not match");
				$("#passerr span").removeClass("fa-check").addClass("fa-exclamation");
				$("#passerr").show();
			}
		}

	)
	//btn_hover
	$("#btn_hover_trig,#btn_hover_list,#btn_hover").click(function () {
		$("#btn_hover_list").toggleClass("open_menu");
		$("#btn_hover_trig").toggleClass("fa fa-comments");
		$("#btn_hover_trig").toggleClass("rotate_trig fa fa-times");
	});
	// $("#btn_hover_trig,#btn_hover_list").mouseleave(
	// 	function () {
	// 		$("#btn_hover_list").removeClass("open_menu");
	// 		$("#btn_hover_trig").removeClass("rotate_trig");
	// 		$("#btn_hover_trig").addClass("fa fa-comments");
	// 	}
	// )
});
//net value generator
$("#trans_amt").blur(function(){
	var trans_amt = $("#trans_amt").val();
	var rndnum =10 + Math.floor((Math.random() * 90 + 1));
	var net = Math.floor(Math.random() * 50 + 1)
	if(trans_amt >= 1000){
		$("#net").val(net);
		$("#tax").val(rndnum);
		$("#total").val(Number(trans_amt)+Number(rndnum));
		// $("#total").val(net+rndnum);
	}
	}	
);
function parallax() {
	let tscroll = $(window).scrollTop();
	$(".parallax--bg").css({
		backgroundPosition: "center " + tscroll * 0.5 + "px"
	});
}

function navbar() {
	let tscroll = $(window).scrollTop();
	if (tscroll > 30) {
		$("#nav").addClass("nav-fixed");
		$("#nav").addClass("navbar-expand container-fluid");
		$("#brand-img").addClass("d-none");
	} else {
		$("#nav").removeClass("nav-fixed");
		$("#nav").removeClass("navbar-expand container")
		$("#brand-img").removeClass("d-none");
	}
}

