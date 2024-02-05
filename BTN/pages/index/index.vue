<template>
	<view class="home">
		<view class="topnav">
			<u-tabs :list="navlist"
				lineWidth="20"
				lineColor="#00aa7f"
			  :activeStyle="{
				 color: '#303133',
				 fontWeight: 'bold',
				 transform: 'scale(1.05)'
			 }"
			  :inactiveStyle="{
				 color: '#606266',
				 transform: 'scale(1)'
			 }"
			 itemStyle="padding-left: 30px; padding-right: 30px; height: 50px;"
			 @click="clickNav"></u-tabs>
		</view>
		
		<view class="loadingState" v-show="loadState">
			<u-skeleton
				rows="4"
				title
				loading
				
			></u-skeleton>
		</view>
		
		
		<view class="content">
			<view class="item" v-for="item in dataList">
				<blog-item @delEvent="P_delEvent" :item="item" :isLike.sync="item.isLike" :like_count.sync="item.like_count"></blog-item>
			</view>
		</view>
		
		<view>
			<uni-load-more :status="uniLoad"></uni-load-more>
		</view>
		
		<view class="edit" @click="goEdit">
			<u-icon name="edit-pen" color="#ffffff" size="35"></u-icon>
		</view>
		
	</view>
</template>

<script>
	import {
		store,
		mutations
	} from '@/uni_modules/uni-id-pages/common/store.js'
	const db=uniCloud.database();
	const dbCmd=db.command;
	export default {
		data() {
			return {
				uniLoad:"more",
				noMore:false,
				navlist:[
					{
						name:"最新",
						type:"publish_date"
					},
					{
						name:"热门",
						type:"view_count"
					}
				],
				dataList:[],
				navAction:0,
				loadState:true
			}
		},
		onLoad() {
			this.getData();

		},
		
		// 触底加载更多
		onReachBottom(){
			this.uniLoad='loading'
			if(this.noMore) return this.uniLoad="noMore";
			this.getData();
		},
		
		
		methods: {
			P_delEvent(){
				this.dataList=[];
				
				this.getData();
			},
			
			
			// 获取网络列表
			 getData(){
				let artTemp=db.collection("luntan_article").where(`delState != true`).field("title,user_id,description,picurls,comment_count,like_count,view_count,publish_date").getTemp();
				let userTemp =db.collection("uni-id-users").field("_id,username,nickname,avatar_file").getTemp();
				db.collection(artTemp,userTemp).orderBy(this.navlist[this.navAction].type,"desc").skip(this.dataList.length).limit(5).get().
				then(async res=>{
					let idArr=[]
					let oldArr=this.dataList;
					if(res.result.data.length==0){
						this.noMore=true
					}
					let resDataArr=[...this.dataList,...res.result.data]
					
					
					if(store.hasLogin){
						
						resDataArr.forEach(item=>{
							idArr.push(item._id);
						})
						
						let likeRes=await db.collection("luntan_like").where({
							article_id:dbCmd.in(idArr),
							user_id:uniCloud.getCurrentUserInfo().uid
						}).get()
						
						likeRes.result.data.forEach(item=>{
							let findIndex=resDataArr.findIndex(find=>{
								return item.article_id ==find._id
							})
							resDataArr[findIndex].isLike = true
						})
					}
					
					this.dataList=resDataArr
					this.loadState=false
				})
			},
			
			
			clickNav(e){
				this.loadState=true;
				this.dataList=[];
				this.uniLoad="more"
				this.navAction=e.index;
				this.noMore=false
				this.getData();
			},
			
			// 跳转至编辑页面
			goEdit(){
				uni.navigateTo({
					url:"/pages/edit/edit"
				})
			},

		}
	}
</script>

<style lang="scss" scoped>
.home{
	.topnav{
		
	}
	
	.loadingState{
		padding: 30rpx;
	}
	.content{
		.item{
			padding:30rpx;
			border-bottom: #f7f7f7 15rpx solid;
		}
	}
	.edit{
		width: 120rpx;
		height: 120rpx;
		background: #00aa7f;
		border-radius: 50%;
		color:#fff;
		position: fixed;
		z-index: 100;
		bottom:150rpx;
		right: 50rpx;
		display:flex;
		justify-content: center;
		align-items: center;
		box-shadow: 0 0 20rpx rgba(0, 170, 127, 0.8);
	}
}

</style>
