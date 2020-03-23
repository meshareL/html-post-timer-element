# &lt;post-timer&gt; Element

Post http request and display the countdown

## Installation
```text
npm install @tomoeed/html-post-timer-element --save
```

## Usage
```html
<input id="csrf" name="_csrf" value="token" type="hidden">
<input id="type" name="type" value="post" type="hidden">

<post-timer href="/post" forbidden-time="120" for="csrf, type">
    <!-- post-timer 元素包含的input元素可以不添加id属性 -->
    <input name="" value="" type="hidden">
    <span data-original-content>Get captcha</span>
    <p data-timekeeping-content hidden>
        Resend after
        <span data-timekeeping-content-time></span>
        seconds
    </p>
    <span data-afresh-content hidden>Resend</span>
</post-timer>
```
## Attributes
- `href`: 服务端`URL`
- `forbidden-time`: `<post-timer>`元素禁止时间
- `for`: input元素id属性

## Events
- `post-timer:ajax-start` 即将发送HTTP请求, 该事件可以取消
  ```javascript
  document.addEventListener('post-timer:ajax-start', event => {
      !event.defaultPrevented && event.preventDefault();
  });
  ```
  
- `post-timer:ajax-send` 发送HTTP请求之前修改请求数据
  - `detail.requestInit` [Fetch Request](https://developer.mozilla.org/en-US/docs/Web/API/Request)
      ```javascript
      document.addEventListener('post-timer:ajax-send', event => {
          const {headers, body} = event.detail.requestInit;
          headers.append('X-Requested-With', 'XMLHttpRequest');
          body.append('_csrf', 'token');
      });
      ```
    
- `post-timer:ajax-end` HTTP请求已完成, 在`post-timer:ajax-success`和`post-timer:ajax-error`之前调度
  ```javascript
  document.addEventListener('post-timer:ajax-end', event => {
      console.log('request completed');
  });
  ```
  
- `post-timer:ajax-success` 服务器返回状态码 `200 >= status < 300`
  - `detail.response` [Fetch Response](https://developer.mozilla.org/en-US/docs/Web/API/Response)
    ```javascript
    document.addEventListener('post-timer:ajax-success', async event => {
        const {response} = event.detail;
        await response.json();
    });
    ```

- `post-timer:ajax-error` 服务器返回状态码 `200 < status >= 300`
  - `detail.response` [Fetch Response](https://developer.mozilla.org/en-US/docs/Web/API/Response)
    ```javascript
    document.addEventListener('post-timer:ajax-error', async event => {
        const {response} = event.detail;
        await response.json();
    });
    ```
- `post-timer:network-error` 网络故障或任何阻止请求完成
  - `detail.error`
    ```javascript
    document.addEventListener('post-timer:network-error', event => {
        console.log(event.detail.error);
    });
    ```
    
- `post-timer:timekeeping-start` 请求完成后开始倒计时禁用时间
  ```javascript
  document.addEventListener('post-timer:timekeeping-start', event => {
      console.log('start the countdown');
  });
  ```

- `post-timer:timekeeping-end` 倒计时禁用时间已结束
  ```javascript
  document.addEventListener('post-timer:timekeeping-end', event => {
      console.log('the countdown is over');
  });
  ```
  
## License
[Apache-2.0](https://github.com/meshareL/html-post-timer-element/blob/master/LICENSE)
