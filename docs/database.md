### 数据库设计

#### object 表
userId, id, name, type, children, parentId, projectId, data

* userId: 用户 id
* id: 每个对象的唯一 id
* name: 对象名称
* type: 对象类型，分别有
  * project: 项目
  * page: 页面
  * group: 组
  * rect: 块
* children: 子对象 id 数组
* parentId: 父对象 id
* projectId: 所属项目 id
* pageId: 所属 page id
* data: 对象信息

#### objectShare 表
##### 当用户点击分享时候，在此表生成一个 project 的备份
userId, id, objectId, password, jsonData

* userId: 用户 id
* id: 唯一 id
* projectId: 项目 id
* password: 没密码则全员可见
* jsonData: 一个项目的整个 json
