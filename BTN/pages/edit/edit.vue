<template>
	<view class="edit">
		<view class="title">
			<input type="text" v-model="artObj.title" placeholder="标题" placeholder-class="placeholderClass">
		</view>
		<view class="content">
			<editor 
			class="myEdit"
			placeholder="写点什么吧~~"
			show-img-size
			show-img-toolbar
			show-img-resize
			@ready="onEditReady"
			@focus="onFocus"
			@statuschange="onStatuschange"
			></editor>
		</view>
		<view class="btnGroup">
			<u-button @click="onSubmit" type="primary" text="发布" :disabled="!artObj.title.length" color="#00aa7f"></u-button>
		</view>
		<view class="tools" v-if="toolShow">
			<view class="H" @click="clickHead">
				<text class="Hac" :class="headShow ? 'active' : ''">H</text>
			</view>
			<view class="B" @click="clickBold">
				<text class="Bac" :class="boldShow ? 'active' : ''">B</text>
			</view>
			<view class="I" @click="clickItalic">
				<text class="Iac" :class="italicShow ? 'active' : ''">I</text>
			</view>
			<view class="fgx" @click="clickDivider">
				<text>分割线</text>
			</view>
			<view class="phototb" @click="clickinsertImage">
				<u-icon class="pac" name="photo" color="#000000" size="23"></u-icon>
			</view>
			<view class="checkbox-marktb" @click="editOk">
				<u-icon class="cmac" name="checkbox-mark" color="#000000" size="23"></u-icon>
			</view>
		</view>
	</view>
</template>

<script>
	import {getImgSrc,getProvince} from "@/utils/tools.js"
	const db = uniCloud.database()
import col from '../../uni_modules/uview-ui/libs/config/props/col';
	export default {
		data() {
			return {
				toolShow:true,
				headShow:false,
				boldShow:false,
				italicShow:false,
				artObj:{
					title:"",
					content:"",
					description:"",
					picurls:"",
					province:""
				}
			};
		},
		
		// 调用高德地图
		onLoad(){
			getProvince().then(res=>{
				this.artObj.province=res
			})
		},
		
		
		
		methods:{
			// 点击提交按钮
			onSubmit(){
				this.editorCtx.getContents({
					success:res=>{
						this.artObj.description=res.text.slice(0,80);
						this.artObj.content=res.html;
						this.artObj.picurls=getImgSrc(res.html)
						uni.showLoading({
							title:"发布中..."
						})
						this.addData();
					}
				})
			},
			
			addData(){
				db.collection("luntan_article").add({
					...this.artObj
				}).then(res=>{
					
					uni.hideLoading();
					uni.showToast({
						title:"发布成功"
					})
					setTimeout(()=>{
						uni.reLaunch({
							url:"/pages/index/index"
						})
					},800)
				})
			},
			
			// 初始化
			onEditReady(){
				uni.createSelectorQuery().in(this).select('.myEdit').fields({
					size:true,
					context:true
				},res=>{
					
					this.editorCtx=res.context
				}).exec()
			},
			
			checkStatus(name, detail, obj) {
				if (detail.hasOwnProperty(name)) {
					this[obj] = true;					
				} else {
					this[obj] = false;
				}
			},
			
			
			// 当样式发送改变的时候
			onStatuschange(e){
				let detail=e.detail
				this.checkStatus("header",detail,"headShow");
				this.checkStatus("bold",detail,"boldShow");
				this.checkStatus("italic",detail,"italicShow");
			},
			
			// 添加图像
			clickinsertImage(){
				uni.chooseImage({
					success:async res=>{
						
						uni.showLoading({
							title:"上传中请稍后",
							mask:true
						})
						for (let item of res.tempFiles) {
							let suffix = item.path.substring(item.path.lastIndexOf("."));
							let randomName=Date.now() + "" + String( Math.random()).substr(3,6)+suffix
							let res= await uniCloud.uploadFile({
								filePath:item.path,
								cloudPath:item.name || randomName
							})
							this.editorCtx.insertImage({
								src:res.fileID
							})
						}
						uni.hideLoading()
					}
				})
			},
			
			
			// 点击钩确认
			editOk(){
				this.toolShow=false;
			},
			
			// 设置倾斜
			clickItalic(){
				this.italicShow=!this.italicShow;
				this.editorCtx.format("italic")
			},
			
			
			// 加粗
			clickBold(){
				this.boldShow=!this.boldShow
				this.editorCtx.format("bold")
			},
			
			
			
			// 添加大标题
			clickHead(){
				this.headShow=!this.headShow
				this.editorCtx.format("header",this.headShow ? 'H2':false)
			},
			
			
			
			
			// 添加分割线
			clickDivider(){
				this.editorCtx.insertDivider();
			},
			
			
			
			
			// 离开焦点
			onFocus(){
				this.toolShow=true
			}
		}
	}
</script>

<style lang="scss">
/deep/ .ql-blank::before{
	font-style: normal;
	color: #e0e0e0;
}

.edit{
	padding: 30rpx;
	.title{
		input{
			height: 120rpx;
			font-size: 46rpx;
			border-bottom:1px solid #e4e4e4;
			margin-bottom:30rpx;
			color:#000;
		}
		.placeholderClass{
			color: #e0e0e0;
		}
	}
	.content{
		.myEdit{
			height: calc(100vh - 500rpx);
			margin-bottom:30rpx;
		}
		
	}
	
	.tools{
		width: 100%;
		height: 80rpx;
		background: #fff;
		border-top:1rpx solid #f4f4f4;
		position: fixed;
		left:0;
		bottom:0;
		display: flex;
		justify-content: space-around;
		align-items: center;
		.H{
			font-size: 36rpx;
			.Hac{
				&.active{
					color: #00aa7f;
					
				}
			}
			
		}
		.B{
			font-weight: bold;
			font-size: 36rpx;
			.Bac{
				&.active{
					color: #00aa7f;
					
				}
			}
		}
		.I{
			font-style: italic;
			font-size: 36rpx;
			.Iac{
				&.active{
					color: #00aa7f;
					
				}
			}
		}
		.fgx{
			font-size: 27rpx;
		}
		.phototb{
			.pac{
				
			}
			
		}
		.checkbox-marktb{
			.cmac{
				
			}
			
		}
	}
}
</style>
