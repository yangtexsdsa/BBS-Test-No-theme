<template>
	<!-- 帖子组件 -->
	<view class="blogitem">
		<view class="head">
			<view class="userinfo">
				<view class="avatar">
					<image :src="giveAvatar(item)" mode="aspectFill"></image>
				</view>
				<view class="name">
					{{giveName(item)}}
				</view>
				<view class="time">
					<uni-dateformat :date="item.publish_date" format="MM月dd hh:mm"
						:threshold="[60000,3600000*24*30]"></uni-dateformat>
				</view>
			</view>

			<view class="more" @click="clickMore">
				<u-icon name="more-dot-fill" color="#000000" size="15"></u-icon>
			</view>
		</view>


		<view class="body">
			<view class="title" @click="goDetail">{{item.title}}</view>
			<view class="text" @click="goDetail" v-if="item.description">
				<view class="t">{{item.description}}</view>
			</view>
			<view class="piclist" v-if="item.picurls.length">
				<view class="pic" :class="item.picurls.length==1 ? 'only': ''" v-for="(pic,index) in item.picurls"
					:key="pic">
					<image @click="clickPic(index)" :src="pic" mode="aspectFill"></image>
				</view>
			</view>
		</view>


		<view class="info">
			<view class="box">
				<u-icon class="boxtb" name="eye" color="#000000" size="20"></u-icon>
				<text>{{item.view_count}}</text>
			</view>
			<view class="box" @click="goDetail">
				<u-icon class="boxtb" name="chat" color="#000000" size="20"></u-icon>
				<text>{{item.comment_count && item.comment_count>0 ? item.comment_count : '评论'}}</text>
			</view>
			<view class="box" @click="clickLike">
				<view class="boxdztb" :class="item.isLike ? 'active' :''">
					<view class="dztb">
						<u-icon name="thumb-up" size="20"></u-icon>
					</view>
					<view class="dzwz">
						<text>{{item.like_count ? item.like_count : '点赞'}}</text>
					</view>
				</view>
			</view>
		</view>
		
		
		<u-action-sheet :actions="list" cancelText="取消" :show="sheetShow" :closeOnClickOverlay="true" :closeOnClickAction="true"
		@select="sheetSelect"
		@close="onClose"
		></u-action-sheet>

	</view>
</template>

<script>
	import pageJson from "@/pages.json"
	import {giveName,giveAvatar,likeFun} from "../../utils/tools.js"
	import {
		store
	} from '@/uni_modules/uni-id-pages/common/store.js'
	const db=uniCloud.database()
	export default {
		name: "blog-item",
		props: {
			item: {
				type: Object,
				default () {
					return {

					}
				}
			},
			isLike:Boolean,
			like_count:Number
		},
		data() {
			return {
				
				
				
				sheetShow:false,
				list:[
					{
						name:"修改",
						type:"edit",
						disabled:true
					},
					{
						name:"删除",
						type:"del",
						color: "#f56c6c",
						disabled:true
					}
				]


			};
		},
		methods: {
			giveName,
			giveAvatar,
			
			// 点赞操作
			clickLike(){
				if(!store.hasLogin){
					uni.showModal({
						title:"登录后操作",
						success:res=>{
							if(res.confirm){
								uni.navigateTo({
									url:"/"+pageJson.uniIdRouter.loginPage
								})
							}
						}
					})
					return;
				}
				
				// 避免用户重复点击
				let time=Date.now();
				if(time - this.likeTime < 2000){
					uni.showToast({
						title:"操作太频繁，请稍后...",
						icon:"none"
					})
					return;
				}
				this.likeTime=time;
				let like_count=this.item.like_count;
				this.item.isLike ? like_count-- : like_count++
				let isLike=!this.item.isLike;
				
				this.$emit("update:isLike",isLike)
				this.$emit("update:like_count",like_count)
				
				// 调用点赞方法
				likeFun(this.item._id);
			
			
				
			},
			
			// 点击更多操作
			clickMore(){
				let uid=uniCloud.getCurrentUserInfo().uid
				if(uid == this.item.user_id[0]._id || this.uniIDHasRole('admin') || this.uniIDHasRole('webmaster')){
					this.list.forEach(item=>{
						item.disabled=false
					})
				}
				this.sheetShow=true;
			},
			
			
			
			// 点击选择
			sheetSelect(e){
				this.sheetShow=false
				let type = e.type;
				console.log(type);
				if(type=="del"){
					this.delFun();
				}
			},
			
			delFun(){
				uni.showLoading({
					title:"加载中..."
				})
				db.collection("luntan_article").doc(this.item._id).update({
					delState:true
				}).then(res=>{
					uni.hideLoading();
					uni.showToast({
						title:"删除成功",
						icon:"none"
					})
					this.$emit("delEvent",true)
				}).catch(err=>{
					uni.hideLoading()
				})
			},
			
			// 取消弹窗
			onClose(){
				this.sheetShow=false
			},
			
			// 点击跳转到详情
			goDetail() {
				uni.navigateTo({
					url: "/pages/detail/detail?id=" + this.item._id
				})
			},



			// 单击图片
			clickPic(index) {
				uni.previewImage({
					urls: this.item.picurls,
					current: index
				})
			}
		}
	}
</script>

<style lang="scss">
	.blogitem {
		.head {
			display: flex;
			font-size: 32rpx;
			align-items: center;
			justify-content: space-between;

			.userinfo {
				display: flex;
				align-items: center;

				.avatar {
					width: 40rpx;
					height: 40rpx;
					border-radius: 50%;
					border-radius: 50%;
					overflow: hidden;

					image {
						width: 100%;
						height: 100%;
						display: block;
					}
				}

				.name {
					color: #222;
					padding-left: 10rpx;
				}

				.time {
					color: #888;
					font-size: 22rpx;
					padding-left: 20rpx;
				}
			}

			.more {
				padding: 5rpx;

				.iconfont {
					font-size: 50rpx;
					color: #888;
				}
			}
		}



		.body {
			padding: 15rpx 0 30rpx;

			.title {
				font-size: 44rpx;
				color: #000;
				font-weight: 600;
				text-align: justify;
				text-overflow: -o-ellipsis-lastline;
				overflow: hidden;
				text-overflow: ellipsis;
				display: -webkit-box;
				-webkit-line-clamp: 2;
				line-clamp: 2;
				-webkit-box-orient: vertical;
			}

			.text {
				padding-top: 10rpx;
				padding-bottom: 10rpx;
				font-size: 30rpx;
				text-align: justify;
				color: #888;

				.t {
					text-overflow: -o-ellipsis-lastline;
					overflow: hidden;
					text-overflow: ellipsis;
					display: -webkit-box;
					-webkit-line-clamp: 2;
					line-clamp: 2;
					-webkit-box-orient: vertical;
				}
			}

			.piclist {
				display: flex;
				padding-top: 20rpx;

				.pic {
					width: 225rpx;
					height: 225rpx;
					margin-right: 6rpx;
					overflow: hidden;

					image {
						width: 100%;
						height: 100%;
					}

					&:first-child {
						border-radius: 20rpx 0 0 20rpx;
					}

					&:last-child {
						border-radius: 0 20rpx 20rpx 0;
					}

					&.only {
						border-radius: 20rpx;
					}

				}

			}
		}




		.info {
			display: flex;
			align-items: center;
			justify-content: space-around;
			font-size: 26rpx;
			color: #333;

			.box {
				display: flex;
				align-items: center;
				height: 42rpx;
				padding: 15rpx 0 5rpx;
				flex: 1;
				display: flex;
				justify-content: center;
				.boxdztb{
					display: flex;
					align-items: center;
					justify-content: space-around;
					border-radius: 15rpx 15rpx 15rpx 15rpx;
					
				}
				.boxdztb.active{
					// text-decoration: underline;
					border-bottom: 1rpx solid #00aa7f;
					// padding-bottom: 1rpx;
					background: #eefff7;
					color: #00aa7f;
				}
			

			}
			
			
		}


	}
</style>