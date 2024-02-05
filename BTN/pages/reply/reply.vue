<template>
	<view class="reply">
		<view class="top">
			<comment-item :closeBtn="true" :childState="true" :item="replyItem"></comment-item>
			
		</view>
		<view class="hfnr">
			<text>回复内容</text>
		</view>
		<view class="list">
			<view class="row" v-for="item in childReplyArr">
				<comment-item @removeEnv="commentEnv" :childState="true" :item="item"></comment-item>
			</view>
		</view>
		
		<view>
			<comment-frame 
			@commentEnv="commentEnv"
			:commentObj="commentObj" 
			:placeholder="`回复：${giveName(this.replyItem)}`"></comment-frame>
		</view>
	</view>
</template>

<script>
	import {giveName,giveAvatar} from "../../utils/tools.js"
	const db=uniCloud.database()
	export default {
		data() {
			return {
				replyItem:null,
				commentObj:{
					article_id:"",
					comment_type:1,
					reply_user_id:"",
					reply_comment_id:""
				},
				childReplyArr:[]
			};
		},
		onLoad(e){
			let replyItem=uni.getStorageSync("replyItem");
			if(!replyItem) return uni.navigateBack();
			this.replyItem=replyItem || {}
			this.commentObj.article_id=this.replyItem.article_id;
			this.commentObj.reply_user_id=this.replyItem.user_id[0]._id;
			this.commentObj.reply_comment_id=this.replyItem._id;
			this.getComment();
		},
		// 销毁缓存
		onUnload(){
			uni.removeStorageSync("replyItem")
		},
		methods:{
			giveName,giveAvatar,
			
			// 评论成功后的回调
			commentEnv(){
				this.childReplyArr=[];
				this.getComment();
			},
			
			
			// 获取子集评论列表
			getComment(){
				let commentTemp=db.collection("luntan_comment").where(`article_id == "${this.replyItem.article_id}" && comment_type==1 && reply_comment_id== "${this.replyItem._id}"`).orderBy("comment_date desc").limit(10).getTemp();
				let userTemp=db.collection("uni-id-users").field("_id,username,nickname,avatar_file").getTemp()
			
				db.collection(commentTemp,userTemp).get().then(res=>{
					console.log(res);
					this.childReplyArr=res.result.data
				})
			
			}
			
			
		}
		
		
	}
</script>

<style lang="scss">
.reply{
	.top{
		padding: 30rpx;
		border-bottom: 5rpx solid #d2eae2;
		
		
	}
	.hfnr{
		height:30rpx;
		width: 100rpx;
		padding-top: 5rpx;
		padding-bottom: 10rpx;
		padding-left: 20rpx;
		padding-right: 23rpx;
		border-radius: 0rpx 0rpx 40rpx 0rpx;
		font-size: 25rpx;
		background: #d2eae2;
		display: flex;
		align-items: center;
		justify-content: start;
	}
	.list{
		padding: 30rpx;
		padding-top: 50rpx;
		.row{
			padding-top: 10rpx;
			
		}
	}
}
</style>
