<template>
	<view>
		<view class="comment-item">
			<view class="avatar">
				<u-avatar :src="giveAvatar(item)" size="26"></u-avatar>
			</view>
			<view class="wrap" @click="goReply">
				<view class="username">
					<text class="uname">
					{{giveName(item)}}
					</text>
					<view v-if="!closeBtn" class="gbtb" @click.stop="delComment">
						<u-icon name="more-dot-fill" color="#ababab" size="15"></u-icon>
					</view>
				</view>
				<view class="comment-content">
					{{item.comment_content}}
				</view>
				<view class="info">
					<view class="reply-btn">
						<view class="pltwo" v-if="!childState">
							{{item.totalReply || ''}}回复
						</view>
						<view class="pltime">
							<uni-dateformat :date="item.comment_date" :threshold="[60000,3600000*24*30]"></uni-dateformat>
						</view>
						<view class="plmap">
							{{item.province}}
						</view>
					</view>
				</view>
			</view>

		</view>
	</view>
</template>

<script>
	import {giveName,giveAvatar} from "../../utils/tools.js"
	const db=uniCloud.database()
	const utilsObj=uniCloud.importObject("utilsObj",{
		customUI:true
	});
	
	
	export default {
		name: "comment-item",
		data() {
			return {

			};
		},
		props:{
			item:{
				type:Object,
				default(){
					return {}
				}
			},
			childState:{
				type:Boolean,
				default:false
			},
			closeBtn:{
				type:Boolean,
				default:false
			}
		},
		methods:{
			giveName,giveAvatar,
			// 跳转到回复页面
			goReply(){
				if(this.childState) return;
				uni.setStorageSync("replyItem",this.item)
				uni.navigateTo({
					url:"/pages/reply/reply"
				})
			},
			
			delComment(){
				let uid=uniCloud.getCurrentUserInfo().uid
				if(uid == this.item.user_id[0]._id || 
				this.uniIDHasRole('admin') || 
				this.uniIDHasRole('webmaster')){
					uni.showModal({
						title:"是否确认删除",
						success:res=>{
							if(res.confirm){
								this.removeComment();
							}
						}
					})
					
					return;
				}
				
				uni.showToast({
					title:"权限不够",
					icon:"error"
				})
				
				
				
			},
			
			removeComment(){
				db.collection("luntan_comment").doc(this.item._id).remove()
				.then(res=>{
					uni.showToast({
						title:"已删除"
					})
					this.$emit("removeEnv",{id:this.item._id})
					if(this.item.comment_count>0){
						utilsObj.operation("luntan_article","comment_count",this.item.article_id,-1)
					}
					
				})
			}
			
		}
	}
</script>

<style lang="scss" scoped>
	.comment-item {
		display: flex;
		padding-bottom: 20rpx;

		.wrap {
			flex: 1;
			padding-left: 20rpx;
			padding-bottom: 20rpx;
			background: #fbffff;
			border-radius: 20rpx 20rpx 20rpx 20rpx;
			border-bottom: 1rpx solid #00aa7f;
			
			.username {
				border-bottom: 1rpx solid #d3eee6;
				font-size: 25rpx;
				padding-bottom: 8rpx;
				padding-top: 8rpx;
				display: flex;
				align-items: center;
				justify-content: space-between;
				.uname{
					
				}
				.gbtb{
					padding-right: 20rpx;
					padding-left: 20rpx;
					// border: 1px solid red;
				}
			}

			.comment-content {
				// height: 100rpx;
				padding-top: 5rpx;
				padding-bottom: 10rpx;
				font-size: 30rpx;
			}

			.info {
				.reply-btn {
					display: flex;
					align-items: center;
					justify-content: start;
					font-size: 25rpx;
					.pltwo {
						background: #d2eae2;
						padding-right: 15rpx;
						padding-left: 15rpx;
						border-radius: 20rpx 20rpx 20rpx 20rpx;
						padding-top: 5rpx;
						padding-bottom: 5rpx;
					}

					.pltime {
						padding-right: 20rpx;
						padding-left: 20rpx;

					}

					.plmap {

						padding-right: 20rpx;
						padding-left: 20rpx;

					}
				}
			}

		}
	}
</style>