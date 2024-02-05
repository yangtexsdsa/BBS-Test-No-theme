//获取富文本内的图片url地址
export function getImgSrc(richtext,num=3) {
	let imgList = [];
	richtext.replace(/<img [^>]*src=['"]([^'"]+)[^>]*>/g, (match, capture) => {
		  imgList.push(capture);
	});
	imgList=imgList.slice(0,num)
	return imgList;
}


// 向外导出省份
export function getProvince(){
	return new Promise((resolve,reject)=>{
		let historyProvince=uni.getStorageSync("historyProvince");
		if(historyProvince){
			// console.log("走了缓存逻辑")
			if((Date.now() - historyProvince.time) > 1000*60*60){
				// console.log("走了重新请求网络的逻辑")
				 getIP().then(res=>{
				 	resolve(res)
				 }).catch(err=>{
				 	reject(err)
				 })
			}else{
				// console.log("直接读取的缓存")
				resolve(historyProvince.province);
			}
		}else{
			// console.log("第一次直走网络")
			getIP().then(res=>{
				resolve(res)
			}).catch(err=>{
				reject(err)
			})
				
		}
	
	})
}


// 获取所在省市
function getIP(){
	return new Promise((resolve,reject)=>{
		uni.request({
			url:"https://restapi.amap.com/v3/ip?key=f8f1244c1b96c88e8d0fa2c3c25de3e1",
			success:res=>{
				console.log("这是网络请求")
				let str=""
				typeof(res.data.province) == "string" ? str=res.data.province: str="火星"
				resolve(str)
				let obj={
					province:str,
					time:Date.now()
				}
				
				uni.setStorageSync("historyProvince",obj);
				
			},
			fail:err=>{
				reject(err)
			}
		})
	})
	
	
}


// 获取昵称
export function giveName(item){
	return item.user_id[0].nickname || item.user_id[0].username || item.user_id[0].mobile || "未设置昵称"
}


// 获取默认头像
export function giveAvatar(item){
	return item.user_id[0]?.avatar_file?.url ?? '/static/my-.png'
}


const db=uniCloud.database();
const utilsObj=uniCloud.importObject("utilsObj",{
	customUI:true
});

// 点赞操作数据库的方法
export async function likeFun(artid){
	let count=await db.collection("luntan_like").where(`article_id=="${artid}" && user_id==$cloudEnv_uid`).count()
	
	if(count.result.total){
		db.collection("luntan_like").where(`article_id=="${artid}" && user_id==$cloudEnv_uid`)
		.remove();
		utilsObj.operation("luntan_article","like_count",artid,-1)
	}else{
		db.collection("luntan_like").add({
			article_id:artid
		})
		utilsObj.operation("luntan_article","like_count",artid,1)
	}
}