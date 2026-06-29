DROP TABLE [dbo].[blogs];
CREATE TABLE [dbo].[blogs] (
    [id] int,
    [title] nvarchar(255),
    [summary] nvarchar(MAX),
    [content] nvarchar(MAX),
    [image_url] nvarchar(MAX),
    [created_at] datetime DEFAULT (getdate()),
    PRIMARY KEY ([id])
);

DROP TABLE [dbo].[project_details];
CREATE TABLE [dbo].[project_details] (
    [id] int,
    [project_id] int,
    [icon] nvarchar(255),
    [detail_title] nvarchar(255),
    [detail_description] nvarchar(MAX),
    CONSTRAINT [FK__project_d__proje__4BAC3F29] FOREIGN KEY ([project_id]) REFERENCES [dbo].[projects]([id]) ON DELETE 1,
    PRIMARY KEY ([id])
);

DROP TABLE [dbo].[projects];
CREATE TABLE [dbo].[projects] (
    [id] int,
    [project_number] nvarchar(50),
    [title] nvarchar(255),
    [summary] nvarchar(MAX),
    [github_url] nvarchar(MAX),
    [tech_stack] nvarchar(MAX),
    PRIMARY KEY ([id])
);

INSERT INTO [dbo].[blogs] ([id],[title],[summary],[content],[image_url],[created_at]) VALUES (4,'Triển khai graceful shutdown để không downtime khi dùng AWS ALB, HAProxy và Kubernetes','Vì sao rolling update vẫn gây 502/503? Vì pod cũ bị tắt nhưng traffic vẫn có thể đi vào nó. Nếu app nhận SIGTERM rồi thoát ngay, request đang xử lý sẽ bị cắt, gây 502, 503, connection reset hoặc timeout','<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Graceful Shutdown và Zero Downtime Deployment</title>
  <style>
    :root {
      --bg-color: #f8fafc;
      --text-color: #334155;
      --heading-color: #0f172a;
      --primary-color: #2563eb;
      --border-color: #e2e8f0;
      --tag-bg: #eff6ff;
      --tag-text: #1d4ed8;
    }

    * { box-sizing: border-box; }

    body {
      margin: 0;
      padding: 0;
      font-family: ''Inter'', -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: var(--text-color);
      background-color: var(--bg-color);
    }

    .container {
      max-width: 100%;
      padding: 2rem;
    }

    header {
      text-align: left;
      margin-bottom: 3rem;
    }

    h1 {
      color: var(--heading-color);
      font-size: 2.5rem;
      line-height: 1.2;
      margin: 0 0 0.5rem;
    }

    .subtitle {
      color: #64748b;
      font-size: 1.1rem;
      margin: 0;
      max-width: 900px;
    }

    .blog-post {
      margin-bottom: 4rem;
      padding-bottom: 2rem;
      border-bottom: 1px solid var(--border-color);
    }

    .post-date {
      display: block;
      color: #94a3b8;
      font-size: 0.9rem;
      font-weight: 500;
      margin-bottom: 1rem;
    }

    .post-title {
      color: var(--heading-color);
      font-size: 2rem;
      line-height: 1.3;
      margin: 0 0 1rem;
    }

    .tags {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-bottom: 1.5rem;
    }

    .tag {
      background-color: var(--tag-bg);
      color: var(--tag-text);
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.85rem;
      font-weight: 600;
    }

    .post-content {
      font-size: 1.05rem;
    }

    .post-content h2 {
      color: var(--heading-color);
      margin-top: 2.5rem;
      margin-bottom: 1rem;
      border-bottom: 1px solid var(--border-color);
      padding-bottom: 0.5rem;
    }

    .post-content h3 {
      color: var(--heading-color);
      margin-top: 2rem;
      margin-bottom: 1rem;
    }

    .post-content p {
      margin-bottom: 1.2rem;
    }

    .post-content ul {
      margin-bottom: 1.5rem;
      padding-left: 1.5rem;
    }

    .post-content li {
      margin-bottom: 0.5rem;
    }

    code {
      background-color: #f1f5f9;
      color: #ef4444;
      padding: 0.2rem 0.4rem;
      border-radius: 4px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 0.9em;
    }

    pre {
      background-color: #1e293b;
      color: #f8fafc;
      padding: 1rem;
      border-radius: 6px;
      overflow-x: auto;
      margin-bottom: 1.5rem;
      line-height: 1.5;
    }

    pre code {
      background-color: transparent;
      color: inherit;
      padding: 0;
      font-size: 0.9em;
    }

    figure {
      margin: 1.5rem 0;
    }

    figure img {
      width: 100%;
      max-height: 360px;
      object-fit: cover;
      display: block;
      border-radius: 6px;
    }

    figcaption {
      color: #64748b;
      font-size: 0.9rem;
      margin-top: 0.5rem;
    }

    .footer {
      text-align: center;
      margin-top: 4rem;
      padding-top: 2rem;
      border-top: 1px solid var(--border-color);
      color: #64748b;
    }

    @media (max-width: 700px) {
      .container { padding: 1.25rem; }
      h1 { font-size: 2rem; }
      .post-title { font-size: 1.6rem; }
    }

  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>Tech Blog & Case Studies</h1>
      <p class="subtitle">Chia sẻ kiến thức về DevOps, Kubernetes, Load Balancing & Production Deployment</p>
    </header>

    <article class="blog-post">
      <time class="post-date">Tháng 6, 2026</time>
      <h2 class="post-title">Graceful Shutdown và Zero Downtime Deployment</h2>
      <div class="tags">
        <span class="tag">Kubernetes</span>
        <span class="tag">HAProxy</span>
        <span class="tag">AWS ALB</span>
        <span class="tag">Zero Downtime</span>
        <span class="tag">DevOps</span>
      </div>
      <div class="post-content">
<p>Khi deploy version mới, Kubernetes hoặc hệ thống orchestration sẽ terminate instance/pod cũ. Nếu ứng dụng tắt ngay lập tức, các request đang xử lý có thể bị mất kết nối. Nếu load balancer vẫn tiếp tục gửi traffic vào backend đang shutdown, người dùng có thể gặp lỗi 502, 503, connection reset hoặc timeout.</p>
<p>Trong một hệ thống web/API thực tế, request thường đi qua nhiều lớp:</p>
<pre><code class="language-text">Client -&gt; AWS ALB -&gt; HAProxy -&gt; Kubernetes Service -&gt; Pod/Application</code></pre>
<figure><img src="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&amp;w=1400&amp;auto=format&amp;fit=crop" alt="Cloud load balancing and Kubernetes traffic flow"><figcaption>Cloud load balancing and Kubernetes traffic flow</figcaption></figure>
<p>Mục tiêu của graceful shutdown không chỉ là tắt app cho đẹp. Mục tiêu thật sự là không nhận request mới khi service chuẩn bị dừng, hoàn tất request đang xử lý, cho load balancer đủ thời gian loại backend khỏi pool, đảm bảo health check phản ánh đúng trạng thái, và tránh downtime trong rolling deployment.</p>
<h2 id="luồng-request-cơ-bản">Luồng request cơ bản</h2>
<p>ALB nhận traffic public, health check target, và có cơ chế deregistration delay hay connection draining. Khi target bị deregister, ALB ngừng gửi request mới tới target đó, nhưng vẫn cho request đang chạy hoàn tất trong thời gian cấu hình.</p>
<p>HAProxy thường đóng vai trò reverse proxy hoặc internal load balancer. Nó có health check backend riêng, có thể mark backend là drain/disabled, và có các timeout riêng như client, server, connect, http-request.</p>
<p>Kubernetes chịu trách nhiệm rolling update pod. Khi pod bị terminate, Kubernetes chạy preStop hook nếu có, gửi SIGTERM cho container, chờ terminationGracePeriodSeconds, rồi gửi SIGKILL nếu container chưa thoát.</p>
<p>Application là lớp cuối cùng nhưng lại rất quan trọng. App phải bắt SIGTERM, ngừng nhận request mới, đợi request đang chạy xong, đóng connection pool, message consumer, background worker, rồi mới exit process.</p>
<h2 id="vì-sao-vẫn-downtime-dù-đã-dùng-load-balancer">Vì sao vẫn downtime dù đã dùng load balancer?</h2>
<h3 id="lỗi-1-app-nhận-sigterm-rồi-exit-ngay">Lỗi 1: App nhận SIGTERM rồi exit ngay</h3>
<p>Nếu process thoát ngay khi nhận SIGTERM, request đang xử lý bị cắt giữa chừng. Client có thể nhận 502, connection reset hoặc timeout.</p>
<h3 id="lỗi-2-readiness-probe-vẫn-báo-healthy-khi-pod-đang-shutdown">Lỗi 2: Readiness probe vẫn báo healthy khi pod đang shutdown</h3>
<p>Nếu <code>/ready</code> vẫn trả 200 trong lúc app đang drain, Kubernetes Service vẫn có thể route traffic vào pod đó. HAProxy hoặc ALB cũng có thể tiếp tục xem backend là healthy.</p>
<h3 id="lỗi-3-prestop-hook-quá-ngắn-hoặc-không-có">Lỗi 3: preStop hook quá ngắn hoặc không có</h3>
<p>Pod termination và load balancer health check không phải lúc nào cũng đồng bộ tức thì. Không có preStop delay, traffic mới vẫn có thể đi vào backend trong vài giây đầu shutdown.</p>
<h3 id="lỗi-4-terminationgraceperiodseconds-quá-nhỏ">Lỗi 4: terminationGracePeriodSeconds quá nhỏ</h3>
<p>Nếu request hợp lệ có thể chạy 20-30 giây nhưng grace period chỉ 10 giây, Kubernetes sẽ SIGKILL container trước khi request hoàn tất.</p>
<h3 id="lỗi-5-alb-deregistration-delay-không-khớp-với-app-graceful-timeout">Lỗi 5: ALB deregistration delay không khớp với app graceful timeout</h3>
<p>Nếu ALB vẫn giữ connection nhưng app đã exit, client vẫn lỗi. Ngược lại, nếu app chờ rất lâu nhưng ALB timeout ngắn hơn, request cũng không hoàn tất như kỳ vọng.</p>
<h3 id="lỗi-6-haproxy-health-check-quá-chậm">Lỗi 6: HAProxy health check quá chậm</h3>
<p>Nếu HAProxy mất nhiều giây mới phát hiện backend không sẵn sàng, trong khoảng đó nó vẫn có thể gửi request mới vào backend đang terminate.</p>
<h2 id="nguyên-tắc-graceful-shutdown-đúng">Nguyên tắc graceful shutdown đúng</h2>
<ul>
<li>Khi chuẩn bị shutdown, app chuyển readiness sang false.</li>
<li>Load balancer ngừng gửi request mới vào backend đó.</li>
<li>App vẫn giữ process sống để xử lý request đang chạy.</li>
<li>Sau khi request hoàn tất hoặc graceful timeout hết hạn, app mới thoát.</li>
<li>terminationGracePeriodSeconds phải đủ lớn hơn toàn bộ thời gian drain thực tế.</li>
</ul>
<pre><code class="language-text">terminationGracePeriodSeconds &gt;= preStop delay
  + LB health check interval * unhealthy threshold
  + app graceful timeout
  + buffer</code></pre>
<p>Ví dụ preStop sleep 10s, HAProxy health check phát hiện unhealthy 5s, app graceful timeout 30s, buffer 10s thì terminationGracePeriodSeconds nên khoảng 55-60s.</p>
<h2 id="cấu-hình-kubernetes-mẫu">Cấu hình Kubernetes mẫu</h2>
<pre><code class="language-yaml">apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-service
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 0
      maxSurge: 1
  selector:
    matchLabels:
      app: api-service
  template:
    metadata:
      labels:
        app: api-service
    spec:
      terminationGracePeriodSeconds: 60
      containers:
        - name: api-service
          image: example/api-service:1.0.0
          ports:
            - containerPort: 8080
          lifecycle:
            preStop:
              exec:
                command: [&quot;/bin/sh&quot;, &quot;-c&quot;, &quot;sleep 10&quot;]
          readinessProbe:
            httpGet:
              path: /ready
              port: 8080
            periodSeconds: 5
            failureThreshold: 1
          livenessProbe:
            httpGet:
              path: /live
              port: 8080
            periodSeconds: 10
            failureThreshold: 3</code></pre>
<p><code>maxUnavailable: 0</code> giúp rolling update không làm giảm số pod available. <code>maxSurge: 1</code> cho phép tạo pod mới trước khi xóa pod cũ. <code>preStop sleep 10s</code> tạo thời gian để endpoint bị remove khỏi Service và load balancer cập nhật.</p>
<h2 id="logic-application-cần-có">Logic application cần có</h2>
<p>App nên có hai endpoint riêng:</p>
<ul>
<li><code>/live</code>: báo process còn sống, không nên fail chỉ vì app đang shutdown nhẹ.</li>
<li><code>/ready</code>: báo app có sẵn sàng nhận traffic mới hay không. Khi nhận SIGTERM, endpoint này phải trả 503 ngay.</li>
</ul>
<p>Ví dụ Node.js:</p>
<pre><code class="language-js">const express = require(&quot;express&quot;);
const http = require(&quot;http&quot;);

const app = express();
let isShuttingDown = false;

app.get(&quot;/live&quot;, (req, res) =&gt; {
  res.status(200).send(&quot;OK&quot;);
});

app.get(&quot;/ready&quot;, (req, res) =&gt; {
  if (isShuttingDown) {
    return res.status(503).send(&quot;SHUTTING_DOWN&quot;);
  }
  res.status(200).send(&quot;READY&quot;);
});

app.get(&quot;/api&quot;, async (req, res) =&gt; {
  await new Promise(resolve =&gt; setTimeout(resolve, 3000));
  res.send(&quot;done&quot;);
});

const server = http.createServer(app);

server.listen(8080, () =&gt; {
  console.log(&quot;server started&quot;);
});

process.on(&quot;SIGTERM&quot;, () =&gt; {
  console.log(&quot;SIGTERM received&quot;);
  isShuttingDown = true;

  server.close(() =&gt; {
    console.log(&quot;all connections closed&quot;);
    process.exit(0);
  });

  setTimeout(() =&gt; {
    console.error(&quot;force shutdown after timeout&quot;);
    process.exit(1);
  }, 30000);
});</code></pre>
<h2 id="cấu-hình-haproxy-mẫu">Cấu hình HAProxy mẫu</h2>
<pre><code class="language-haproxy">global
    log stdout format raw local0
    maxconn 4096

defaults
    log global
    mode http
    option httplog
    option http-server-close
    timeout connect 5s
    timeout client 60s
    timeout server 60s
    timeout http-request 10s

frontend http_in
    bind *:80
    default_backend api_backend

backend api_backend
    balance roundrobin
    option httpchk GET /ready
    http-check expect status 200

    default-server inter 5s fall 1 rise 2 slowstart 10s

    server api-1 api-service-1:8080 check
    server api-2 api-service-2:8080 check
    server api-3 api-service-3:8080 check</code></pre>
<p><code>option httpchk GET /ready</code> giúp HAProxy chỉ route vào backend thật sự ready. <code>fall 1</code> giúp backend bị loại nhanh khi <code>/ready</code> trả 503. <code>rise 2</code> tránh backend vừa lên đã nhận traffic quá sớm. <code>slowstart 10s</code> giúp pod mới nhận traffic tăng dần.</p>
<h2 id="cấu-hình-aws-alb">Cấu hình AWS ALB</h2>
<p>Target Group health check nên trỏ vào <code>/ready</code>, success code là 200, interval khoảng 5-10s, timeout 3-5s. Deregistration delay nên khớp với graceful shutdown timeout của app, thường bắt đầu với 30s hoặc 60s rồi điều chỉnh theo metrics.</p>
<pre><code class="language-bash">aws elbv2 modify-target-group-attributes   --target-group-arn arn:aws:elasticloadbalancing:region:account:targetgroup/name/id   --attributes Key=deregistration_delay.timeout_seconds,Value=60</code></pre>
<p>Nếu dùng AWS Load Balancer Controller:</p>
<pre><code class="language-yaml">metadata:
  annotations:
    alb.ingress.kubernetes.io/target-group-attributes: deregistration_delay.timeout_seconds=60</code></pre>
<h2 id="timeline-shutdown-chuẩn-khi-deploy">Timeline shutdown chuẩn khi deploy</h2>
<pre><code class="language-text">T0: Kubernetes quyết định terminate pod cũ.
T1: Kubernetes chạy preStop hook, ví dụ sleep 10s.
T2: App nhận SIGTERM, set readiness = false.
T3: Readiness probe fail, pod bị remove khỏi Endpoint.
T4: HAProxy hoặc ALB thấy /ready trả 503, ngừng gửi request mới.
T5: Request cũ vẫn tiếp tục xử lý trong app.
T6: App hoàn tất request cũ, đóng server, đóng DB connection.
T7: Process exit 0.
T8: Kubernetes xóa pod.</code></pre>
<h2 id="checklist-production">Checklist production</h2>
<ul>
<li>App handle SIGTERM.</li>
<li>App có <code>/ready</code> và <code>/live</code> riêng.</li>
<li><code>/ready</code> trả 503 khi app đang shutdown.</li>
<li>Kubernetes readinessProbe dùng <code>/ready</code>.</li>
<li>Có preStop delay phù hợp.</li>
<li>terminationGracePeriodSeconds đủ lớn.</li>
<li>rollingUpdate <code>maxUnavailable = 0</code> với service quan trọng.</li>
<li>ALB health check dùng <code>/ready</code>.</li>
<li>ALB deregistration delay phù hợp.</li>
<li>HAProxy health check dùng <code>/ready</code>.</li>
<li>HAProxy timeout client/server đủ lớn.</li>
<li>PodDisruptionBudget được cấu hình cho workload quan trọng.</li>
<li>Metrics theo dõi 5xx, latency, request duration, pod termination time.</li>
<li>Test bằng load test trong lúc rolling restart.</li>
</ul>
<h2 id="cách-test-zero-downtime">Cách test zero downtime</h2>
<pre><code class="language-bash">while true; do
  curl -s -o /dev/null -w &quot;%{http_code}\n&quot; https://example.com/api
  sleep 0.1
done</code></pre>
<p>Hoặc dùng <code>hey</code>:</p>
<pre><code class="language-bash">hey -z 2m -c 50 https://example.com/api</code></pre>
<p>Trong lúc đó chạy:</p>
<pre><code class="language-bash">kubectl rollout restart deployment/api-service</code></pre>
<h2 id="kết-luận">Kết luận</h2>
<p>Zero downtime không chỉ là bật rolling update. Nó là sự phối hợp giữa application, Kubernetes, HAProxy và ALB.</p>
<p>App phải shutdown graceful, readiness phải phản ánh trạng thái nhận traffic, load balancer phải có connection draining, grace period phải đủ dài, và cuối cùng vẫn phải test bằng traffic thật hoặc load test.</p>
      </div>
    </article>

    <footer class="footer">Blog thực hành DevOps Production - UI đơn giản, full trang.</footer>
  </div>
</body>
</html>','https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1400&auto=format&fit=crop','2026-05-29 00:36:50.000'),(5,'Xây dựng hệ thống xử lý ảnh Event-Driven trên AWS','Trong bài viết này, chúng ta xây dựng pipeline serverless với S3, SQS, Lambda, DynamoDB Stream và SNS.','<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Xây dựng hệ thống xử lý ảnh Event-Driven trên AWS với S3, SQS, Lambda, DynamoDB Stream và SNS</title>
  <meta name="description" content="Pipeline serverless với S3, SQS, Lambda, DynamoDB Stream và SNS." />
  <style>
    :root {
      --bg-color: #f8fafc;
      --text-color: #334155;
      --heading-color: #0f172a;
      --primary-color: #2563eb;
      --border-color: #e2e8f0;
      --tag-bg: #eff6ff;
      --tag-text: #1d4ed8;
    }

    * {
      box-sizing: border-box;
    }

    body {
      font-family: ''Inter'', -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: var(--text-color);
      background-color: var(--bg-color);
      margin: 0;
      padding: 0;
    }

    .container {
      max-width: 100%;
      padding: 2rem;
    }

    header {
      text-align: left;
      margin-bottom: 3rem;
    }

    h1 {
      color: var(--heading-color);
      font-size: 2.5rem;
      margin-bottom: 0.5rem;
      line-height: 1.2;
    }

    .subtitle {
      color: #64748b;
      font-size: 1.1rem;
      max-width: 900px;
    }

    .blog-post {
      margin-bottom: 4rem;
      padding-bottom: 2rem;
      border-bottom: 1px solid var(--border-color);
    }

    .post-date {
      color: #94a3b8;
      font-size: 0.9rem;
      font-weight: 500;
      margin-bottom: 1rem;
      display: block;
    }

    .post-title {
      color: var(--heading-color);
      font-size: 2rem;
      margin-top: 0;
      margin-bottom: 1rem;
      line-height: 1.3;
    }

    .tags {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-bottom: 1.5rem;
    }

    .tag {
      background-color: var(--tag-bg);
      color: var(--tag-text);
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.85rem;
      font-weight: 600;
    }

    .post-content {
      font-size: 1.05rem;
    }

    .post-content h2 {
      color: var(--heading-color);
      margin-top: 2.5rem;
      margin-bottom: 1rem;
      border-bottom: 1px solid var(--border-color);
      padding-bottom: 0.5rem;
    }

    .post-content h3 {
      color: var(--heading-color);
      margin-top: 2rem;
      margin-bottom: 1rem;
    }

    .post-content p {
      margin-bottom: 1.2rem;
    }

    .post-content ul {
      margin-bottom: 1.5rem;
      padding-left: 1.5rem;
    }

    .post-content li {
      margin-bottom: 0.5rem;
    }

    .post-content a {
      color: var(--primary-color);
      font-weight: 600;
      text-decoration: none;
    }

    .post-content a:hover {
      text-decoration: underline;
    }

    code {
      background-color: #f1f5f9;
      color: #ef4444;
      padding: 0.2rem 0.4rem;
      border-radius: 4px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 0.9em;
    }

    pre {
      background-color: #1e293b;
      color: #f8fafc;
      padding: 1rem;
      border-radius: 6px;
      overflow-x: auto;
      margin-bottom: 1.5rem;
    }

    pre code {
      background-color: transparent;
      color: inherit;
      padding: 0;
      font-size: 0.9em;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin: 1.5rem 0;
      background: transparent;
    }

    th, td {
      border: 1px solid var(--border-color);
      padding: 0.75rem;
      text-align: left;
      vertical-align: top;
    }

    th {
      background: #f1f5f9;
      color: var(--heading-color);
    }

    .post-content > div {
      background: transparent;
      border: 1px solid var(--border-color);
      border-radius: 6px;
      padding: 1rem;
      margin: 1.5rem 0;
    }

    .footer {
      text-align: center;
      margin-top: 4rem;
      padding-top: 2rem;
      border-top: 1px solid var(--border-color);
      color: #64748b;
    }

    @media (max-width: 600px) {
      .container {
        padding: 1.25rem;
      }

      h1 {
        font-size: 2rem;
      }

      .post-title {
        font-size: 1.55rem;
      }

      table {
        display: block;
        overflow-x: auto;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>Tech Blog & Case Studies</h1>
      <p class="subtitle">Chia sẻ kiến thức về AWS Serverless, Event-Driven Architecture và Cloud Computing.</p>
    </header>

    <article class="blog-post">
      <time class="post-date">Tháng 6, 2026</time>
      <h2 class="post-title">Xây dựng hệ thống xử lý ảnh Event-Driven trên AWS với S3, SQS, Lambda, DynamoDB Stream và SNS</h2>

      <div class="tags">
        <span class="tag">AWS Serverless</span>
        <span class="tag">Event-Driven</span>
        <span class="tag">S3</span>
        <span class="tag">SQS</span>
        <span class="tag">Lambda</span>
        <span class="tag">DynamoDB</span>
        <span class="tag">SNS</span>
      </div>

      <div class="post-content">
<p>
    Trong bài viết này, chúng ta sẽ xây dựng một hệ thống serverless hoàn chỉnh trên AWS.
    Khi người dùng upload ảnh lên Amazon S3, hệ thống sẽ tự động lưu metadata của ảnh vào DynamoDB
    và gửi email thông báo thông qua Amazon SNS.
  </p>


  <h2>1. Bài toán cần giải quyết</h2>

  <p>
    Trong một hệ thống thực tế, sau khi người dùng upload ảnh, backend thường cần thực hiện nhiều tác vụ phía sau như:
  </p>

  <ul>
    <li>Lưu file ảnh vào object storage.</li>
    <li>Lưu metadata của ảnh vào database.</li>
    <li>Gửi email thông báo cho người dùng.</li>
    <li>Có cơ chế retry nếu xử lý lỗi.</li>
    <li>Không cần quản lý server thủ công.</li>
  </ul>

  <p>
    Nếu xử lý toàn bộ trong một request upload, hệ thống sẽ dễ bị chậm, khó mở rộng và khó kiểm soát lỗi.
    Vì vậy, ta sử dụng kiến trúc Event-Driven để tách nhỏ từng bước xử lý.
  </p>

  <h2>2. Kiến trúc tổng thể</h2>

  <div>
    <div>
      <div>👤 User Upload Image</div>
      <div>⬇️</div>
      <div>🪣 Amazon S3</div>
      <div>⬇️ ObjectCreated Event</div>
      <div>📩 Amazon SQS</div>
      <div>⬇️ Trigger</div>
      <div>⚡ Lambda #1: ProcessImageMetadataFunction</div>
      <div>⬇️ PutItem</div>
      <div>🗄️ DynamoDB: ImageMetadataTable</div>
      <div>⬇️ DynamoDB Stream</div>
      <div>⚡ Lambda #2: NotifyImageUploadFunction</div>
      <div>⬇️ Publish</div>
      <div>📢 Amazon SNS</div>
      <div>⬇️</div>
      <div>📧 Email Notification</div>
    </div>
  </div>

  <h2>3. Các dịch vụ sử dụng</h2>

  <table>
    <thead>
      <tr>
        <th>Dịch vụ</th>
        <th>Vai trò</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Amazon S3</td>
        <td>Lưu trữ ảnh upload</td>
      </tr>
      <tr>
        <td>Amazon SQS</td>
        <td>Hàng đợi trung gian để buffer event</td>
      </tr>
      <tr>
        <td>AWS Lambda #1</td>
        <td>Đọc message từ SQS và lưu metadata vào DynamoDB</td>
      </tr>
      <tr>
        <td>Amazon DynamoDB</td>
        <td>Lưu metadata của ảnh</td>
      </tr>
      <tr>
        <td>DynamoDB Stream</td>
        <td>Phát event khi có item mới</td>
      </tr>
      <tr>
        <td>AWS Lambda #2</td>
        <td>Đọc DynamoDB Stream và gửi notification</td>
      </tr>
      <tr>
        <td>Amazon SNS</td>
        <td>Gửi email thông báo</td>
      </tr>
    </tbody>
  </table>

  <h2>4. Vì sao dùng SQS giữa S3 và Lambda?</h2>

  <p>
    Một thiết kế đơn giản hơn có thể là S3 gọi trực tiếp Lambda.
    Tuy nhiên, trong môi trường production, cách này không tối ưu nếu lượng upload tăng đột biến hoặc Lambda gặp lỗi tạm thời.
  </p>

  <div>
    <strong>Thiết kế tốt hơn:</strong>
    <p>S3 → SQS → Lambda</p>
  </div>

  <p>SQS giúp hệ thống:</p>

  <ul>
    <li>Không mất message khi Lambda lỗi.</li>
    <li>Có cơ chế retry tự động.</li>
    <li>Buffer traffic khi có nhiều file upload cùng lúc.</li>
    <li>Tách biệt producer và consumer.</li>
  </ul>

  <h2>5. Tạo S3 Bucket</h2>

  <p>Đầu tiên, tạo một S3 bucket để lưu ảnh upload.</p>

  <pre><code>Bucket name: image-upload-source-bucket-kien
Region: ap-southeast-2
Event type: ObjectCreated:Put</code></pre>

  <p>
    Bucket này sẽ phát sinh event mỗi khi có object mới được upload.
  </p>

  <h2>6. Tạo SQS Queue</h2>

  <p>Tạo một SQS Standard Queue:</p>

  <pre><code>Queue name: image-upload-queue
Queue type: Standard</code></pre>

  <p>
    Không dùng FIFO Queue cho bài lab này vì S3 Event Notification phù hợp nhất với Standard Queue trong mô hình đơn giản.
  </p>

  <h3>SQS Access Policy</h3>

  <p>
    Để S3 có thể gửi message vào SQS, queue cần có policy cho phép service <code>s3.amazonaws.com</code> gọi <code>sqs:SendMessage</code>.
  </p>

  <pre><code>{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowS3SendMessage",
      "Effect": "Allow",
      "Principal": {
        "Service": "s3.amazonaws.com"
      },
      "Action": "sqs:SendMessage",
      "Resource": "arn:aws:sqs:ap-southeast-2:606030503959:image-upload-queue",
      "Condition": {
        "StringEquals": {
          "aws:SourceAccount": "606030503959"
        },
        "ArnLike": {
          "aws:SourceArn": "arn:aws:s3:::image-upload-source-bucket-kien"
        }
      }
    }
  ]
}</code></pre>

  <h2>7. Tạo Event Notification trên S3</h2>

  <p>Trong S3 bucket, vào phần Properties → Event notifications và tạo event:</p>

  <pre><code>Event name: image-upload-event
Event type: PUT
Destination: SQS Queue
Queue: image-upload-queue</code></pre>

  <p>
    Từ giờ, mỗi khi upload ảnh lên S3, một message sẽ được gửi vào SQS.
  </p>

  <h2>8. Tạo DynamoDB Table</h2>

  <p>Tạo bảng DynamoDB để lưu metadata ảnh.</p>

  <pre><code>Table name: ImageMetadataTable
Partition key: image_id
Type: String</code></pre>

  <p>Một item mẫu sau khi upload ảnh:</p>

  <pre><code>{
  "image_id": "image-upload-source-bucket-kien/anh.jpg",
  "bucket_name": "image-upload-source-bucket-kien",
  "object_key": "anh.jpg",
  "object_size": 271646,
  "status": "UPLOADED",
  "created_at": "2026-05-31T18:03:10.902576+00:00"
}</code></pre>

  <h2>9. Bật DynamoDB Stream</h2>

  <p>
    DynamoDB Stream giúp phát hiện khi bảng có item mới được thêm vào.
  </p>

  <pre><code>Stream status: Enabled
View type: NEW_AND_OLD_IMAGES</code></pre>

  <p>
    Trong bài này, Lambda #2 sẽ chỉ xử lý event có loại <code>INSERT</code>.
  </p>

  <h2>10. Tạo Lambda #1: ProcessImageMetadataFunction</h2>

  <p>Lambda đầu tiên có nhiệm vụ đọc message từ SQS và ghi metadata vào DynamoDB.</p>

  <pre><code>Function name: ProcessImageMetadataFunction
Runtime: Python 3.13
Trigger: Amazon SQS
Environment variable:
TABLE_NAME=ImageMetadataTable</code></pre>

  <h3>Code Lambda #1</h3>

  <pre><code>import json
import os
import boto3
from datetime import datetime, timezone
from urllib.parse import unquote_plus

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table(os.environ["TABLE_NAME"])


def lambda_handler(event, context):
    print("Received event:", json.dumps(event))

    for record in event["Records"]:
        body = json.loads(record["body"])

        for s3_record in body.get("Records", []):
            bucket_name = s3_record["s3"]["bucket"]["name"]

            object_key = unquote_plus(
                s3_record["s3"]["object"]["key"]
            )

            object_size = s3_record["s3"]["object"].get("size", 0)

            event_time = s3_record.get("eventTime")

            image_id = f"{bucket_name}/{object_key}"

            item = {
                "image_id": image_id,
                "bucket_name": bucket_name,
                "object_key": object_key,
                "object_size": object_size,
                "status": "UPLOADED",
                "event_time": event_time,
                "created_at": datetime.now(timezone.utc).isoformat()
            }

            print("Putting item to DynamoDB:", item)

            table.put_item(Item=item)

    return {
        "statusCode": 200,
        "body": json.dumps("Image metadata saved successfully")
    }</code></pre>

  <h3>IAM Role cho Lambda #1</h3>

  <p>Lambda #1 cần các quyền:</p>

  <ul>
    <li>Đọc message từ SQS.</li>
    <li>Xóa message sau khi xử lý.</li>
    <li>Ghi item vào DynamoDB.</li>
    <li>Ghi log vào CloudWatch.</li>
  </ul>

  <pre><code>AWSLambdaBasicExecutionRole
AmazonSQSFullAccess
AmazonDynamoDBFullAccess</code></pre>

  <h2>11. Tạo SNS Topic</h2>

  <p>Tạo SNS Topic để gửi email thông báo.</p>

  <pre><code>Topic name: image-upload-notification-topic
Type: Standard</code></pre>

  <div>
    <strong>Lưu ý:</strong>
    <p>
      Không tạo SNS FIFO Topic. FIFO Topic không hỗ trợ Email Subscription trong trường hợp này.
    </p>
  </div>

  <h3>Tạo Email Subscription</h3>

  <pre><code>Protocol: Email
Endpoint: your-email@gmail.com
Status: Confirmed</code></pre>

  <p>
    Sau khi tạo subscription, AWS sẽ gửi email xác nhận. Bạn cần mở Gmail và bấm Confirm subscription.
  </p>

  <h2>12. Tạo Lambda #2: NotifyImageUploadFunction</h2>

  <p>
    Lambda thứ hai nhận event từ DynamoDB Stream và gửi email thông báo qua SNS.
  </p>

  <pre><code>Function name: NotifyImageUploadFunction
Runtime: Python 3.13
Trigger: DynamoDB Stream
Environment variable:
SNS_TOPIC_ARN=arn:aws:sns:ap-southeast-2:606030503959:image-upload-notification-topic</code></pre>

  <h3>Code Lambda #2</h3>

  <pre><code>import json
import os
import boto3

sns = boto3.client("sns")

SNS_TOPIC_ARN = os.environ["SNS_TOPIC_ARN"]


def get_dynamodb_value(attribute):
    if "S" in attribute:
        return attribute["S"]

    if "N" in attribute:
        return attribute["N"]

    return ""


def lambda_handler(event, context):
    print("Received DynamoDB Stream event:", json.dumps(event))

    for record in event["Records"]:
        event_name = record["eventName"]

        if event_name != "INSERT":
            print(f"Skipping event type: {event_name}")
            continue

        new_image = record["dynamodb"]["NewImage"]

        image_id = get_dynamodb_value(
            new_image.get("image_id", {})
        )

        bucket_name = get_dynamodb_value(
            new_image.get("bucket_name", {})
        )

        object_key = get_dynamodb_value(
            new_image.get("object_key", {})
        )

        object_size = get_dynamodb_value(
            new_image.get("object_size", {})
        )

        status = get_dynamodb_value(
            new_image.get("status", {})
        )

        created_at = get_dynamodb_value(
            new_image.get("created_at", {})
        )

        message = f"""
A new image has been uploaded.

Image ID: {image_id}
Bucket: {bucket_name}
Object Key: {object_key}
Size: {object_size} bytes
Status: {status}
Created At: {created_at}
"""

        print("Publishing message to SNS:")
        print(message)

        response = sns.publish(
            TopicArn=SNS_TOPIC_ARN,
            Subject="New Image Uploaded",
            Message=message
        )

        print("SNS publish response:", response)

    return {
        "statusCode": 200,
        "body": json.dumps("Notification processed successfully")
    }</code></pre>

  <h3>IAM Role cho Lambda #2</h3>

  <pre><code>AWSLambdaBasicExecutionRole
AmazonSNSFullAccess
AWSLambdaDynamoDBExecutionRole</code></pre>

  <h2>13. Gắn DynamoDB Stream Trigger cho Lambda #2</h2>

  <p>Trong DynamoDB Table, tạo trigger:</p>

  <pre><code>Source: ImageMetadataTable Stream
Destination: NotifyImageUploadFunction
Starting position: Latest
State: Enabled</code></pre>

  <p>
    Sau bước này, mỗi khi DynamoDB có item mới, Lambda #2 sẽ tự động chạy.
  </p>

  <h2>14. Test end-to-end</h2>

  <p>Upload file <code>anh.jpg</code> vào S3 bucket.</p>

  <h3>Kiểm tra SQS</h3>

  <p>
    Nếu thấy message in flight, nghĩa là Lambda đang nhận message từ queue.
  </p>

  <pre><code>Messages Available: 0
Messages In Flight: 1</code></pre>

  <h3>Kiểm tra DynamoDB</h3>

  <p>
    Trong bảng ImageMetadataTable, item mới sẽ xuất hiện.
  </p>

  <pre><code>image_id: image-upload-source-bucket-kien/anh.jpg
bucket_name: image-upload-source-bucket-kien
object_key: anh.jpg
object_size: 271646
status: UPLOADED</code></pre>

  <h3>Kiểm tra email</h3>

  <p>Email nhận được sẽ có nội dung:</p>

  <pre><code>Subject: New Image Uploaded

A new image has been uploaded.

Image ID: image-upload-source-bucket-kien/anh.jpg
Bucket: image-upload-source-bucket-kien
Object Key: anh.jpg
Size: 271646 bytes
Status: UPLOADED
Created At: 2026-05-31T18:03:10.902576+00:00</code></pre>

  <h2>15. Các lỗi thường gặp</h2>

  <h3>Lỗi 1: S3 không gửi được event vào SQS</h3>

  <pre><code>Unable to validate the following destination configurations</code></pre>

  <p>Nguyên nhân là SQS chưa cấp quyền cho S3 gửi message.</p>

  <p>Cách sửa: thêm SQS Access Policy cho <code>s3.amazonaws.com</code>.</p>

  <h3>Lỗi 2: Lambda #1 không ghi được DynamoDB</h3>

  <pre><code>AccessDeniedException when calling the PutItem operation</code></pre>

  <p>
    Nguyên nhân là role của Lambda thiếu quyền <code>dynamodb:PutItem</code>.
  </p>

  <p>
    Cách sửa: gắn <code>AmazonDynamoDBFullAccess</code> hoặc policy tối thiểu có quyền <code>dynamodb:PutItem</code>.
  </p>

  <h3>Lỗi 3: Không thấy Email protocol trong SNS</h3>

  <p>
    Nguyên nhân là tạo nhầm SNS FIFO Topic.
  </p>

  <p>
    Cách sửa: tạo lại SNS Topic loại <strong>Standard</strong>.
  </p>

  <h3>Lỗi 4: Không nhận được email</h3>

  <p>Kiểm tra SNS Subscription phải ở trạng thái:</p>

  <pre><code>Confirmed</code></pre>

  <p>
    Nếu là Pending confirmation, hãy mở email và bấm xác nhận.
  </p>

  <h2>16. Kết quả cuối cùng</h2>

  <p>Sau khi hoàn thành, hệ thống hoạt động theo luồng:</p>

  <div>
    <div>
      <div>Upload ảnh vào S3</div>
      <div>⬇️</div>
      <div>S3 gửi event vào SQS</div>
      <div>⬇️</div>
      <div>Lambda #1 lưu metadata vào DynamoDB</div>
      <div>⬇️</div>
      <div>DynamoDB Stream kích hoạt Lambda #2</div>
      <div>⬇️</div>
      <div>Lambda #2 publish message vào SNS</div>
      <div>⬇️</div>
      <div>Người dùng nhận email thông báo</div>
    </div>
  </div>

  <h2>17. Kết luận</h2>

  <p>
    Qua bài lab này, chúng ta đã xây dựng được một pipeline xử lý ảnh theo mô hình Event-Driven Architecture trên AWS.
  </p>

  <p>
    Mô hình này sử dụng hoàn toàn các dịch vụ serverless và managed service, giúp hệ thống dễ mở rộng,
    ít phải vận hành hạ tầng và phù hợp với nhiều bài toán thực tế.
  </p>

  <p>Kiến trúc này có thể mở rộng thêm cho các use case như:</p>

  <ul>
    <li>Tạo thumbnail sau khi upload ảnh.</li>
    <li>Quét virus file upload.</li>
    <li>OCR trích xuất văn bản từ ảnh.</li>
    <li>Phân loại ảnh bằng AI.</li>
    <li>Lưu log audit cho hệ thống.</li>
    <li>Kết hợp Step Functions để xử lý workflow phức tạp hơn.</li>
  </ul>

  <p>
    Đây là một bài lab rất phù hợp để học AWS Serverless, Event-Driven Architecture,
    cũng như đưa vào portfolio khi học AWS Developer Associate hoặc Solutions Architect.
  </p>
      </div>
    </article>

    <footer class="footer">
      Blog thực hành AWS Serverless Event-Driven Architecture.
    </footer>
  </div>
</body>
</html>','https://media.cloudmentor.pro/assets/use-an-s3-bucket-event-to-trigger-sqs-queue-to-insert-image-info-into-dynamodb-table-202403/ad8de2c4-adb6-41a5-a33d-47f7cf2f0ced.png','2026-06-01 01:19:03.000'),(6,'Blog - CI/CD AWS SAM với GitHub Actions','Blog này tổng hợp cách triển khai ứng dụng AWS SAM với Lambda, API Gateway, DynamoDB, S3 Artifact Bucket và CloudFormation thông qua GitHub Actions.','<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Blog - CI/CD AWS SAM với GitHub Actions</title>
  <style>
    :root {
      --bg-color: #f8fafc;
      --text-color: #334155;
      --heading-color: #0f172a;
      --primary-color: #2563eb;
      --border-color: #e2e8f0;
      --tag-bg: #eff6ff;
      --tag-text: #1d4ed8;
      --muted-color: #64748b;
    }

    * { box-sizing: border-box; }

    body {
      margin: 0;
      padding: 0;
      font-family: ''Inter'', -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.65;
      color: var(--text-color);
      background: var(--bg-color);
    }

    .container {
      width: 100%;
      max-width: 100%;
      padding: 2rem;
    }

    header {
      text-align: left;
      margin-bottom: 3rem;
    }

    h1 {
      margin: 0 0 0.5rem;
      color: var(--heading-color);
      font-size: 2.5rem;
      line-height: 1.2;
      letter-spacing: -0.03em;
    }

    .subtitle {
      margin: 0;
      color: var(--muted-color);
      font-size: 1.1rem;
    }

    .blog-post {
      margin-bottom: 4rem;
      padding-bottom: 2rem;
      border-bottom: 1px solid var(--border-color);
    }

    .post-date {
      display: block;
      margin-bottom: 1rem;
      color: #94a3b8;
      font-size: 0.9rem;
      font-weight: 500;
    }

    .post-title {
      margin: 0 0 1rem;
      color: var(--heading-color);
      font-size: 2rem;
      line-height: 1.3;
    }

    .tags {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-bottom: 1.5rem;
    }

    .tag {
      display: inline-block;
      background: var(--tag-bg);
      color: var(--tag-text);
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.85rem;
      font-weight: 600;
    }

    .post-content {
      font-size: 1.05rem;
    }

    .post-content h2 {
      margin-top: 2.5rem;
      margin-bottom: 1rem;
      padding-bottom: 0.5rem;
      color: var(--heading-color);
      border-bottom: 1px solid var(--border-color);
    }

    .post-content h3 {
      margin-top: 2rem;
      margin-bottom: 1rem;
      color: var(--heading-color);
    }

    .post-content p { margin: 0 0 1.2rem; }
    .post-content ul, .post-content ol { margin: 0 0 1.5rem; padding-left: 1.5rem; }
    .post-content li { margin-bottom: 0.5rem; }

    a {
      color: var(--primary-color);
      font-weight: 600;
      text-decoration: none;
    }

    a:hover { text-decoration: underline; }

    code {
      background: #f1f5f9;
      color: #ef4444;
      padding: 0.2rem 0.4rem;
      border-radius: 4px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 0.9em;
    }

    pre {
      margin: 0 0 1.5rem;
      padding: 1rem;
      overflow-x: auto;
      background: #1e293b;
      color: #f8fafc;
      border-radius: 6px;
    }

    pre code {
      background: transparent;
      color: inherit;
      padding: 0;
      font-size: 0.9em;
    }

    .flow {
      margin-bottom: 1.5rem;
      padding: 1rem;
      overflow-x: auto;
      background: #1e293b;
      color: #f8fafc;
      border-radius: 6px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 0.95rem;
    }

    .note, .warning {
      margin: 1.5rem 0;
      padding: 1rem;
      border-radius: 6px;
      background: #f1f5f9;
    }

    .note { border-left: 4px solid #10b981; }
    .warning { border-left: 4px solid #f97316; }

    .footer {
      margin-top: 4rem;
      padding-top: 2rem;
      border-top: 1px solid var(--border-color);
      color: var(--muted-color);
      text-align: center;
      font-size: 0.95rem;
    }

    @media (max-width: 768px) {
      .container { padding: 1.25rem; }
      h1 { font-size: 2rem; }
      .post-title { font-size: 1.6rem; }
    }
  </style>
</head>
<body>
  <main class="container">
    <header>
      <h1>Tech Blog & Case Studies</h1>
      <p class="subtitle">Chia sẻ kiến thức về DevOps, Cloud Computing & Serverless Architecture</p>
    </header>

    <article class="blog-post">
      <time class="post-date">Tháng 6, 2026</time>
      <h2 class="post-title">Triển khai CI/CD AWS SAM bằng GitHub Actions</h2>
      <div class="tags">
        <span class="tag">AWS SAM</span>
        <span class="tag">GitHub Actions</span>
        <span class="tag">Lambda</span>
        <span class="tag">API Gateway</span>
        <span class="tag">DynamoDB</span>
      </div>

      <div class="post-content">
        <p>Bài viết này hướng dẫn cách tạo pipeline tự động để build và deploy ứng dụng serverless gồm Lambda, API Gateway và DynamoDB lên AWS.</p>

        <h3>🔗 Source code dự án</h3>
        <p>Repository GitHub chứa code mẫu AWS SAM, Lambda, template và workflow CI/CD:<br>
          <a href="https://github.com/Kien-devops/SAM" target="_blank" rel="noopener noreferrer">GitHub: Kien-devops/SAM</a>
        </p>

        <h2>1. Mục tiêu bài lab</h2>
        <p>Sau khi làm xong, hệ thống sẽ chạy theo luồng:</p>
        <div class="flow">Developer → GitHub Repository → GitHub Actions<br>→ sam build → Upload artifact lên S3<br>→ sam deploy → CloudFormation<br>→ API Gateway → Lambda → DynamoDB</div>
        <ul>
          <li>Push code lên GitHub.</li>
          <li>GitHub Actions tự động chạy pipeline.</li>
          <li>SAM build code Lambda.</li>
          <li>SAM deploy hạ tầng lên AWS.</li>
          <li>Người dùng gọi API <code>/hello</code> để kiểm tra kết quả.</li>
        </ul>

        <h2>2. Các thành phần chính</h2>
        <h3>GitHub Actions</h3>
        <p>Là nơi chạy pipeline CI/CD. Khi bạn push code lên nhánh <code>main</code>, workflow sẽ tự động được kích hoạt.</p>

        <h3>AWS SAM</h3>
        <p>Dùng để build và deploy ứng dụng serverless. SAM đọc file <code>template.yaml</code> rồi triển khai Lambda, API Gateway và DynamoDB thông qua CloudFormation.</p>

        <h3>S3 Bucket</h3>
        <p>Dùng để lưu file zip chứa source code Lambda sau khi build.</p>

        <h3>CloudFormation</h3>
        <p>Nhận template từ SAM và tạo hoặc cập nhật tài nguyên trên AWS.</p>

        <h3>Lambda, API Gateway, DynamoDB</h3>
        <p>API Gateway nhận request từ người dùng, chuyển vào Lambda. Lambda xử lý logic và có thể làm việc với DynamoDB.</p>

        <h2>3. Chuẩn bị</h2>
        <ol>
          <li>Tài khoản AWS.</li>
          <li>Repository GitHub chứa source code SAM: <a href="https://github.com/Kien-devops/SAM" target="_blank" rel="noopener noreferrer">Kien-devops/SAM</a>.</li>
          <li>Một S3 Bucket để lưu artifact.</li>
          <li>IAM User hoặc IAM Role có quyền deploy AWS.</li>
          <li>GitHub Secrets để lưu thông tin AWS.</li>
        </ol>
        <div class="warning"><strong>Lưu ý:</strong> Không ghi Access Key trực tiếp vào code. Hãy lưu trong GitHub Secrets.</div>

        <h2>4. Cấu hình GitHub Secrets</h2>
        <p>Vào repository GitHub:</p>
        <pre><code>Settings → Secrets and variables → Actions → New repository secret</code></pre>
        <p>Thêm các secret sau:</p>
        <ul>
          <li><code>AWS_ACCESS_KEY_ID</code>: Access Key ID của AWS.</li>
          <li><code>AWS_SECRET_ACCESS_KEY</code>: Secret Access Key của AWS.</li>
          <li><code>S3_BUCKET</code>: Tên S3 Bucket dùng để chứa artifact.</li>
        </ul>

        <h2>5. File GitHub Actions deploy.yml</h2>
        <p>Tạo file tại đường dẫn:</p>
        <pre><code>.github/workflows/deploy.yml</code></pre>
        <pre><code>name: Deploy AWS SAM

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout source code
        uses: actions/checkout@v4

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ap-southeast-2

      - name: Setup SAM CLI
        uses: aws-actions/setup-sam@v2

      - name: SAM Build
        run: sam build

      - name: SAM Deploy
        run: |
          sam deploy             --stack-name kien-sam             --s3-bucket ${{ secrets.S3_BUCKET }}             --capabilities CAPABILITY_IAM             --region ap-southeast-2             --no-confirm-changeset             --no-fail-on-empty-changeset</code></pre>

        <h2>6. Cấu trúc project</h2>
        <pre><code>.
├── app.py
├── requirements.txt
├── template.yaml
├── event.json
└── .github
    └── workflows
        └── deploy.yml</code></pre>
        <ul>
          <li><code>app.py</code>: Code chính của Lambda.</li>
          <li><code>requirements.txt</code>: Thư viện Python cần cài.</li>
          <li><code>template.yaml</code>: Khai báo Lambda, API Gateway, DynamoDB.</li>
          <li><code>event.json</code>: File test local cho Lambda.</li>
          <li><code>deploy.yml</code>: Pipeline CI/CD.</li>
        </ul>

        <h2>7. Cách chạy pipeline</h2>
        <p>Commit và push code lên GitHub:</p>
        <pre><code>git add .
git commit -m "setup aws sam cicd"
git push origin main</code></pre>
        <p>Sau khi push, vào tab <strong>Actions</strong> trên GitHub để xem pipeline đang chạy. Nếu chạy thành công, ứng dụng sẽ được deploy lên AWS.</p>

        <h2>8. Test API sau khi deploy</h2>
        <p>Vào AWS CloudFormation, chọn stack, mở tab <strong>Outputs</strong>, copy URL của API Gateway.</p>
        <p>Test bằng lệnh:</p>
        <pre><code>curl https://&lt;api-id&gt;.execute-api.ap-southeast-2.amazonaws.com/hello</code></pre>
        <p>Kết quả mong đợi:</p>
        <pre><code>{
  "message": "kết nối thành công sam",
  "method": "GET",
  "path": "/hello",
  "tableName": "sam-cicd-users"
}</code></pre>

        <h2>9. Lỗi thường gặp</h2>
        <ul>
          <li><strong>Pipeline không chạy:</strong> Kiểm tra file có đúng đường dẫn <code>.github/workflows/deploy.yml</code> không.</li>
          <li><strong>Lỗi AWS Credentials:</strong> Kiểm tra lại GitHub Secrets.</li>
          <li><strong>Lỗi quyền IAM:</strong> Kiểm tra IAM có quyền với S3, CloudFormation, Lambda, API Gateway và DynamoDB không.</li>
          <li><strong>Lỗi S3 Bucket:</strong> Kiểm tra tên bucket trong secret <code>S3_BUCKET</code>.</li>
          <li><strong>API lỗi:</strong> Kiểm tra CloudWatch Logs của Lambda.</li>
        </ul>

        <h2>10. Dọn dẹp tài nguyên</h2>
        <ol>
          <li>Xóa stack trong CloudFormation.</li>
          <li>Xóa DynamoDB Table nếu table còn được giữ lại.</li>
          <li>Làm trống và xóa S3 Bucket nếu không dùng nữa.</li>
        </ol>

        <div class="note"><strong>Kết luận:</strong> Chỉ cần push code lên GitHub, GitHub Actions sẽ tự động build và deploy ứng dụng serverless lên AWS bằng SAM.</div>
      </div>
    </article>

    <p class="footer">Blog thực hành CI/CD AWS SAM - Giao diện full trang, đơn giản, dễ đọc.</p>
  </main>
</body>
</html>
','https://media.cloudmentor.pro/assets/create-build-and-deploy-a-sample-hello-world-app-using-aws-sam-202403/a07fd96d-8a4b-419a-bcee-2bb167bc2715.png','2026-06-02 10:00:25.000'),(7,'GitOps không chỉ là CI/CD — đó là mô hình vận hành hiện đại','GitOps sử dụng Git làm single source of truth để quản lý cả ứng dụng và hạ tầng, giúp triển khai an toàn hơn, dễ kiểm toán hơn và tự động khôi phục khi có sai lệch cấu hình.','<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>GitOps: Operating Model cho Cloud Native Delivery</title>
  <meta name="description" content="Bài blog giải thích GitOps: single source of truth, pull-based delivery, repository segregation, drift detection và quy trình vận hành trên Kubernetes." />
  <style>
    :root {
      --bg-color: #f8fafc;
      --text-color: #334155;
      --heading-color: #0f172a;
      --primary-color: #2563eb;
      --border-color: #e2e8f0;
      --tag-bg: #eff6ff;
      --tag-text: #1d4ed8;
      --muted: #64748b;
      --code-bg: #1e293b;
      --code-text: #f8fafc;
    }

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      padding: 0;
      font-family: ''Inter'', -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.7;
      color: var(--text-color);
      background-color: var(--bg-color);
    }

    .container {
      max-width: 100%;
      padding: 2rem;
    }

    header {
      text-align: left;
      margin-bottom: 3rem;
    }

    h1 {
      color: var(--heading-color);
      font-size: 2.5rem;
      line-height: 1.2;
      margin: 0 0 0.75rem;
    }

    .subtitle {
      color: var(--muted);
      font-size: 1.1rem;
      max-width: 980px;
      margin: 0 0 1.2rem;
    }

    .blog-post {
      margin-bottom: 4rem;
      padding-bottom: 2rem;
      border-bottom: 1px solid var(--border-color);
    }

    .post-date {
      color: #94a3b8;
      font-size: 0.9rem;
      font-weight: 500;
      margin-bottom: 1rem;
      display: block;
    }

    .tags {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin: 1rem 0 1.5rem;
    }

    .tag {
      background-color: var(--tag-bg);
      color: var(--tag-text);
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.85rem;
      font-weight: 600;
    }

    .post-content {
      font-size: 1.05rem;
    }

    .post-content h2 {
      color: var(--heading-color);
      margin-top: 2.5rem;
      margin-bottom: 1rem;
      border-bottom: 1px solid var(--border-color);
      padding-bottom: 0.5rem;
      font-size: 1.75rem;
      line-height: 1.3;
    }

    .post-content h3 {
      color: var(--heading-color);
      margin-top: 2rem;
      margin-bottom: 1rem;
      font-size: 1.25rem;
    }

    .post-content p {
      margin-bottom: 1.2rem;
    }

    .lead {
      font-size: 1.1rem;
      color: #475569;
    }

    .post-content ul,
    .post-content ol {
      margin-bottom: 1.5rem;
      padding-left: 1.5rem;
    }

    .post-content li {
      margin-bottom: 0.5rem;
    }

    a {
      color: var(--primary-color);
      text-decoration: none;
      font-weight: 600;
    }

    a:hover {
      text-decoration: underline;
    }

    code {
      background-color: #f1f5f9;
      color: #ef4444;
      padding: 0.2rem 0.4rem;
      border-radius: 4px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 0.9em;
    }

    pre {
      background-color: var(--code-bg);
      color: var(--code-text);
      padding: 1rem;
      border-radius: 6px;
      overflow-x: auto;
      margin-bottom: 1.5rem;
      line-height: 1.5;
    }

    pre code {
      background-color: transparent;
      color: inherit;
      padding: 0;
      font-size: 0.9em;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin: 1.5rem 0;
      background: #ffffff;
    }

    th,
    td {
      border: 1px solid var(--border-color);
      padding: 12px;
      text-align: left;
      vertical-align: top;
    }

    th {
      background: #f1f5f9;
      color: var(--heading-color);
    }

    .simple-flow {
      background: #ffffff;
      border: 1px solid var(--border-color);
      padding: 1rem 1.2rem;
      margin: 1.5rem 0;
    }

    .simple-flow ol {
      margin: 0;
    }

    .footer {
      text-align: center;
      margin-top: 4rem;
      padding-top: 2rem;
      border-top: 1px solid var(--border-color);
      color: var(--muted);
      font-size: 0.95rem;
    }

    @media (max-width: 700px) {
      .container {
        padding: 1.25rem;
      }

      h1 {
        font-size: 2rem;
      }

      .post-content h2 {
        font-size: 1.45rem;
      }

      table {
        display: block;
        overflow-x: auto;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>GitOps không chỉ là CI/CD — đó là mô hình vận hành hiện đại</h1>
      <p class="subtitle">
        GitOps sử dụng Git làm single source of truth để quản lý ứng dụng và hạ tầng,
        giúp triển khai an toàn hơn, dễ kiểm toán hơn và tự động khôi phục khi có sai lệch cấu hình.
      </p>
      <div class="tags">
        <span class="tag">GitOps</span>
        <span class="tag">Kubernetes</span>
        <span class="tag">Argo CD</span>
        <span class="tag">Flux CD</span>
        <span class="tag">DevOps</span>
      </div>
    </header>

    <article class="blog-post">
      <time class="post-date">Tháng 6, 2026</time>

      <div class="post-content">
        <h2>GitOps là gì?</h2>
        <p class="lead">
          GitOps là một operating model trong đó mọi thay đổi của ứng dụng và hạ tầng đều được mô tả bằng file khai báo,
          lưu trong Git, review bằng Pull Request và tự động đồng bộ xuống môi trường chạy thực tế.
        </p>
        <p>
          Điểm quan trọng nhất của GitOps không nằm ở việc dùng công cụ nào, mà nằm ở nguyên tắc:
          <strong>Git là trạng thái mong muốn</strong>. Nếu hệ thống đang chạy khác với Git, controller sẽ phát hiện drift
          và đưa hệ thống quay lại đúng trạng thái đã khai báo.
        </p>

        <h2>1. Những vấn đề trước khi có GitOps</h2>
        <h3>Không có single source of truth</h3>
        <p>
          Cấu hình hạ tầng có thể nằm rải rác trên máy kỹ sư, jump host hoặc server CI.
          Khi có sự cố, rất khó biết phiên bản nào là đúng.
        </p>

        <h3>Configuration drift</h3>
        <p>
          Ví dụ manifest khai báo 5 replicas, nhưng ai đó chỉnh thủ công xuống 3.
          Nếu không có controller giám sát, hệ thống sẽ tiếp tục chạy sai.
        </p>

        <h3>Rủi ro bảo mật</h3>
        <p>
          CI truyền thống thường phải giữ credential để push trực tiếp vào Kubernetes cluster,
          làm tăng bề mặt tấn công.
        </p>

        <h3>Rollback và audit khó khăn</h3>
        <p>
          Nếu cấu hình không được versioning đầy đủ, việc xác định thay đổi gây lỗi và rollback trở nên phức tạp.
        </p>

        <h2>2. Nguyên tắc cốt lõi của GitOps</h2>
        <p>Theo tinh thần Open GitOps, một hệ thống GitOps đúng nghĩa cần xoay quanh các nguyên tắc sau:</p>
        <ul>
          <li><strong>Declarative:</strong> Mọi tài nguyên được mô tả bằng file khai báo như Kubernetes manifest, Helm chart hoặc Terraform.</li>
          <li><strong>Versioned & Immutable:</strong> Mọi thay đổi đi qua Git commit, branch, pull request và lịch sử version rõ ràng.</li>
          <li><strong>Pulled Automatically:</strong> Controller nằm trong cluster tự kéo cấu hình từ Git, không để CI push trực tiếp vào cluster.</li>
          <li><strong>Continuously Reconciled:</strong> Controller liên tục so sánh current state với desired state.</li>
          <li><strong>Self-healing:</strong> Nếu có drift do thao tác thủ công, hệ thống tự đưa trạng thái quay lại đúng với Git.</li>
          <li><strong>Audit-friendly:</strong> Mọi thay đổi có người tạo, người review, thời điểm merge và commit hash rõ ràng.</li>
        </ul>

        <h2>3. Kiến trúc hai repository</h2>
        <p>
          Thực hành GitOps chuẩn thường tách rõ <strong>Application Repository</strong> và
          <strong>Application Configuration Repository</strong>. Cách tách này giúp phân quyền rõ ràng giữa application team
          và DevOps/platform team.
        </p>

        <h3>Application Repository</h3>
        <ul>
          <li>Chứa source code ứng dụng.</li>
          <li>Chứa Dockerfile.</li>
          <li>Chứa Jenkinsfile hoặc GitHub Actions workflow.</li>
          <li>Chạy test, scan và build image.</li>
          <li>Push image lên registry như Amazon ECR hoặc Docker Hub.</li>
        </ul>

        <h3>Configuration Repository</h3>
        <ul>
          <li>Chứa Kubernetes manifests.</li>
          <li>Chứa Helm chart hoặc Kustomize overlay.</li>
          <li>Chứa Terraform nếu cần quản lý hạ tầng.</li>
          <li>Quy định image version, replicas, config và ingress.</li>
          <li>Là nơi GitOps Controller theo dõi.</li>
        </ul>

        <pre><code>gitops-demo/
├── app-repo/
│   ├── src/
│   ├── Dockerfile
│   └── Jenkinsfile
└── config-repo/
    ├── dev/
    │   └── deployment.yaml
    ├── staging/
    │   └── deployment.yaml
    └── prod/
        └── deployment.yaml</code></pre>

        <h2>4. Quy trình GitOps từ source code đến production</h2>
        <p>
          Trong GitOps, CI chỉ chịu trách nhiệm build artifact. Phần deploy do GitOps Controller trong cluster đảm nhiệm.
          Điều này giúp CI không cần credential truy cập Kubernetes cluster.
        </p>

        <div class="simple-flow">
          <ol>
            <li>Developer tạo Pull Request vào application repository.</li>
            <li>CI chạy test, kiểm tra chất lượng và security scan.</li>
            <li>CI build container image.</li>
            <li>Image được push lên Amazon ECR hoặc Docker Hub bằng image digest.</li>
            <li>Automation tạo Pull Request vào configuration repository để cập nhật image mới.</li>
            <li>DevOps review và merge Pull Request cấu hình.</li>
            <li>Argo CD hoặc Flux CD phát hiện thay đổi trong Git.</li>
            <li>Controller pull manifest mới về cluster, apply và reconcile liên tục.</li>
          </ol>
        </div>

        <h2>5. Push-based vs Pull-based</h2>
        <table>
          <thead>
            <tr>
              <th>Tiêu chí</th>
              <th>Push-based CI/CD truyền thống</th>
              <th>Pull-based GitOps</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Cách triển khai</td>
              <td>CI push trực tiếp thay đổi vào cluster.</td>
              <td>Controller trong cluster pull cấu hình từ Git.</td>
            </tr>
            <tr>
              <td>Credential</td>
              <td>CI cần quyền truy cập cluster.</td>
              <td>CI không cần chạm vào cluster.</td>
            </tr>
            <tr>
              <td>Drift detection</td>
              <td>Khó phát hiện nếu có sửa thủ công.</td>
              <td>Controller liên tục phát hiện và sửa drift.</td>
            </tr>
            <tr>
              <td>Rollback</td>
              <td>Chạy lại pipeline hoặc thao tác thủ công.</td>
              <td>Dùng git revert, controller tự đồng bộ lại.</td>
            </tr>
            <tr>
              <td>Bảo mật</td>
              <td>Rủi ro cao hơn do CI giữ secret mạnh.</td>
              <td>An toàn hơn theo nguyên tắc least privilege.</td>
            </tr>
          </tbody>
        </table>

        <h2>6. Vì sao GitOps trưởng thành nhất trên Kubernetes?</h2>
        <p>
          Kubernetes vốn được thiết kế dựa trên mô hình reconciliation. Khi bạn khai báo Deployment có 5 replicas,
          Kubernetes controller sẽ liên tục đảm bảo hệ thống thật sự có 5 pod đang chạy.
        </p>
        <p>
          GitOps mở rộng ý tưởng này: không chỉ object trong cluster được reconcile,
          mà toàn bộ cấu hình triển khai cũng được reconcile với Git.
        </p>

        <h2>Kết luận</h2>
        <p>
          GitOps biến Git thành trung tâm vận hành: mọi thay đổi đều được khai báo, review, versioning, audit và tự động đồng bộ.
          Với Kubernetes, mô hình này đặc biệt mạnh vì tận dụng trực tiếp cơ chế controller và reconciliation vốn có của nền tảng.
        </p>
      </div>
    </article>

    <footer class="footer">
      <p>© 2026 · GitOps Blog Template · Built with HTML and CSS</p>
    </footer>
  </div>
</body>
</html>
',NULL,'2026-06-08 16:52:31.597'),(8,'Case Study: Xây dựng & Triển khai Hệ thống E-Commerce Hybrid với AWS ECS, SAM và Terraform','Case Study chi tiết về việc xây dựng kiến trúc Hybrid trên AWS kết hợp Amazon ECS (Fargate) và AWS SAM cho hệ thống E-Commerce chịu tải cao với Terraform CI/CD.','<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DevOps & Cloud Architecture Case Study</title>
    <style>
        :root {
            --bg-color: #f8fafc;
            --text-color: #334155;
            --heading-color: #0f172a;
            --primary-color: #2563eb;
            --secondary-color: #3b82f6;
            --card-bg: #ffffff;
            --border-color: #e2e8f0;
            --tag-bg: #eff6ff;
            --tag-text: #1d4ed8;
        }

        body {
            font-family: ''Inter'', -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: var(--text-color);
            background-color: var(--bg-color);
            margin: 0;
            padding: 0;
        }

        .container {
            max-width: 100%;
            padding: 2rem;
        }

        header {
            text-align: left;
            margin-bottom: 3rem;
        }

        h1 {
            color: var(--heading-color);
            font-size: 2.5rem;
            margin-bottom: 0.5rem;
        }

        .subtitle {
            color: #64748b;
            font-size: 1.1rem;
        }

        .blog-post {
            margin-bottom: 4rem;
            padding-bottom: 2rem;
            border-bottom: 1px solid var(--border-color);
        }

        .post-date {
            color: #94a3b8;
            font-size: 0.9rem;
            font-weight: 500;
            margin-bottom: 1rem;
            display: block;
        }

        .post-title {
            color: var(--heading-color);
            font-size: 2rem;
            margin-top: 0;
            margin-bottom: 1rem;
            line-height: 1.3;
        }

        .tags {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
            margin-bottom: 1.5rem;
        }

        .tag {
            background-color: var(--tag-bg);
            color: var(--tag-text);
            padding: 0.25rem 0.75rem;
            border-radius: 9999px;
            font-size: 0.85rem;
            font-weight: 600;
        }

        .post-content {
            font-size: 1.05rem;
        }

        .post-content h2 {
            color: var(--heading-color);
            margin-top: 2.5rem;
            margin-bottom: 1rem;
            border-bottom: 1px solid var(--border-color);
            padding-bottom: 0.5rem;
        }

        .post-content h3 {
            color: var(--heading-color);
            margin-top: 2rem;
            margin-bottom: 1rem;
        }

        .post-content p {
            margin-bottom: 1.2rem;
        }

        .post-content ul {
            margin-bottom: 1.5rem;
            padding-left: 1.5rem;
        }

        .post-content li {
            margin-bottom: 0.5rem;
        }

        code {
            background-color: #f1f5f9;
            color: #ef4444;
            padding: 0.2rem 0.4rem;
            border-radius: 4px;
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
            font-size: 0.9em;
        }
        
        pre {
            background-color: #1e293b;
            color: #f8fafc;
            padding: 1rem;
            border-radius: 6px;
            overflow-x: auto;
            margin-bottom: 1.5rem;
        }
        
        pre code {
            background-color: transparent;
            color: inherit;
            padding: 0;
            font-size: 0.9em;
        }

        .read-more {
            display: inline-block;
            margin-top: 1.5rem;
            color: var(--primary-color);
            text-decoration: none;
            font-weight: 600;
            transition: color 0.2s ease;
        }

        .read-more:hover {
            color: #1e40af;
            text-decoration: underline;
        }
        
        .footer {
            text-align: center;
            margin-top: 4rem;
            padding-top: 2rem;
            border-top: 1px solid var(--border-color);
            color: #64748b;
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>Tech Blog & Case Studies</h1>
            <p class="subtitle">Chia sẻ kiến thức về DevOps, Cloud Computing & System Architecture</p>
        </header>

        <article class="blog-post">
            <time class="post-date">Tháng 6, 2026</time>
            <h2 class="post-title">Case Study: Xây dựng & Triển khai Hệ thống E-Commerce Hybrid với AWS ECS, SAM và Terraform</h2>
            <div class="tags">
                <span class="tag">System Architecture</span>
                <span class="tag">AWS ECS</span>
                <span class="tag">AWS SAM</span>
                <span class="tag">Terraform</span>
                <span class="tag">CI/CD</span>
            </div>
            <div class="post-content">
                <p>Nhiều bạn có nhắn tin hỏi mình về cách triển khai chi tiết một kiến trúc hệ thống thương mại điện tử (E-Commerce) chịu tải cao trên AWS. Làm sao để cân bằng giữa hiệu suất ổn định cho các luồng xử lý chính và khả năng mở rộng linh hoạt cho các tác vụ bất đồng bộ? Trong dự án gần đây nhất, mình đã áp dụng kiến trúc <strong>Hybrid</strong> trên AWS, kết hợp <strong>Amazon ECS (Fargate)</strong> và <strong>AWS SAM (Serverless Application Model)</strong>. Dưới đây là bài phân tích và hướng dẫn chi tiết từ A đến Z.</p>
                
                <h3>🔗 Mã Nguồn Dự Án (Source Code)</h3>
                <p>Toàn bộ source code của dự án được mở công khai tại GitHub. Bạn có thể clone về để vọc vạch: <br>
                <strong><a href="https://github.com/Kien-devops/sam-iac-project" target="_blank" style="color: var(--primary-color); font-weight: bold; text-decoration: none;">GitHub: Kien-devops/sam-iac-project</a></strong></p>

                <h2>Phần 1: Tại sao lại là kiến trúc Hybrid?</h2>
                <p>Mỗi công nghệ đều có điểm mạnh riêng. Mình sử dụng kiến trúc Container (ECS Fargate) cho các REST API cốt lõi (như Authentication, Catalog, Orders). Fargate giúp đội ngũ frontend (React + Vite) và backend (Express.js) dễ dàng đồng bộ môi trường phát triển thông qua Docker, đồng thời đảm bảo API luôn "nóng" để phản hồi ngay lập tức cho khách hàng.</p>
                <p>Ngược lại, với các tác vụ xử lý ngầm và event-driven như gửi thông báo (SNS/SQS) hay xử lý file invoice trên S3, việc chạy liên tục một container là vô cùng lãng phí. Đây là lúc AWS SAM tỏa sáng. Các Lambda functions được kích hoạt tự động dựa trên sự kiện, giúp tiết kiệm chi phí tối đa mà vẫn đảm bảo khả năng scale vô hạn khi có flash sale.</p>

                <h2>Phần 2: Hệ thống hoạt động dưới nền tảng (Under the Hood) như thế nào?</h2>
                <p>Để hiểu rõ hơn, chúng ta hãy đi sâu vào cách từng request của người dùng được định tuyến và xử lý bên trong hệ thống AWS.</p>

                <h3>Mạng lưới (Network Layer & VPC)</h3>
                <p>Hệ thống nằm hoàn toàn trong một VPC riêng biệt. Kiến trúc mạng được bảo mật nhiều lớp:</p>
                <ul>
                    <li><strong>Public Subnets</strong>: Nằm ở 2 Availability Zones khác nhau, chứa Application Load Balancer (ALB) và NAT Gateway.</li>
                    <li><strong>Private Subnets</strong>: Các container (ECS Fargate) của Frontend và Backend được giấu kín hoàn toàn tại đây. Chúng không có Public IP, không thể bị truy cập trực tiếp từ Internet, và chỉ kết nối ra ngoài thông qua NAT Gateway.</li>
                </ul>

                <h3>Bộ cân bằng tải (Application Load Balancer)</h3>
                <p>ALB đảm nhận vai trò định tuyến (Path-Based Routing) cực kỳ thông minh tại Layer 7:</p>
                <ul>
                    <li>Nếu user gọi các endpoint bắt đầu bằng <code>/api/*</code>, ALB sẽ đẩy traffic về <strong>Backend Express container</strong> (Target Group port 3000).</li>
                    <li>Với mọi đường dẫn khác, ALB mặc định đẩy về <strong>Frontend Nginx container</strong> (Target Group port 80) để load giao diện React (SPA).</li>
                </ul>

                <h3>Lớp xử lý sự kiện Serverless (AWS SAM)</h3>
                <p>Giả sử một khách hàng vừa thanh toán thành công đơn hàng. Nếu bắt Backend làm việc tạo file PDF hóa đơn và gọi server mail để gửi thư, API sẽ bị block và phản hồi chậm. Giải pháp Event-Driven của mình là:</p>
                <ul>
                    <li>Backend Express lưu đơn hàng vào DB và lập tức ném một sự kiện vào <strong>Amazon SNS (OrderCreatedTopic)</strong> rồi trả kết quả ngay cho User.</li>
                    <li>SNS đẩy thông điệp này vào hàng đợi <strong>Amazon SQS</strong>. SQS làm bộ đệm (buffer) đảm bảo hệ thống không sập dù có hàng nghìn đơn hàng cùng lúc.</li>
                    <li>Các <strong>AWS Lambda functions</strong> (như <code>send-email</code> và <code>generate-invoice</code>) tự động lắng nghe SQS và thực hiện tạo file PDF tải lên S3 cũng như gửi mail giả lập. Tất cả diễn ra song song và cách ly với Backend.</li>
                </ul>

                <h2>Phần 3: Tự động hóa CI/CD với Terraform & GitHub Actions</h2>
                <p>Thay vì click chuột tạo từng VPC hay Application Load Balancer trên giao diện AWS Console thủ công và dễ sai sót, toàn bộ hạ tầng được quản lý bằng <strong>Terraform</strong> (nằm trong thư mục <code>infrastructure/terraform/</code>).</p>
                <p>Thay vì dồn tất cả vào một workflow khổng lồ, mình thiết kế các GitHub Actions workflows riêng biệt nhằm tối ưu thời gian chạy:</p>
                <ul>
                    <li><strong>Frontend Pipeline:</strong> Tự động build React SPA qua Vite, đóng gói Docker và đẩy lên ECR.</li>
                    <li><strong>Backend Pipeline:</strong> Chạy Unit tests với Jest, sau đó quét lỗ hổng bảo mật Docker image bằng <strong>Trivy</strong> trước khi deploy (DevSecOps).</li>
                    <li><strong>Serverless Pipeline:</strong> Chạy <code>sam build</code> và deploy các CloudFormation templates tương ứng với AWS Lambda.</li>
                    <li><strong>Infrastructure Pipeline:</strong> Luôn kiểm tra <code>terraform fmt</code> và <code>terraform plan</code> để tránh các sai sót làm sập hệ thống.</li>
                </ul>

                <h2>Phần 4: Hướng dẫn Setup & Thực hành</h2>
                
                <p>Bạn có thể trải nghiệm dự án này theo 2 cách: Chạy thử ở dưới Local hoặc Deploy thẳng lên Cloud (AWS) tự động thông qua CI/CD.</p>

                <h3>Cách 1: Chạy thử nghiệm ở Local (Local Sandbox)</h3>
                <p>Nếu bạn chỉ muốn xem code hoạt động ra sao mà không tốn phí Cloud, hãy sử dụng Docker Compose:</p>
                <pre><code># 1. Clone source code
git clone https://github.com/Kien-devops/sam-iac-project.git
cd sam-iac-project

# 2. Khởi chạy toàn bộ hệ thống
./scripts/local-start.sh</code></pre>
                <p>Kiểm tra tại trình duyệt: <br>
                - Frontend: <code>http://localhost:8080</code><br>
                - Backend Health Check: <code>http://localhost:3000/api/health</code></p>
                <p>Sau khi vọc vạch xong, bạn dùng lệnh <code>./scripts/local-stop.sh</code> để tắt và dọn dẹp các container.</p>

                <h3>Cách 2: Triển khai lên AWS Cloud bằng GitHub Actions (CI/CD)</h3>
                <p>Hệ thống này đã được thiết lập sẵn các luồng CI/CD. Thay vì phải tự gõ từng lệnh Terraform hay SAM, bạn chỉ cần cấu hình GitHub Repo của mình để nó tự động làm mọi thứ.</p>

                <p><strong>Bước 1: Tạo Repository của riêng bạn</strong></p>
                <pre><code>git clone https://github.com/Kien-devops/sam-iac-project.git
cd sam-iac-project
# Xóa git cũ và đẩy code lên Repo mới của bạn
rm -rf .git
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/&lt;USERNAME_CỦA_BẠN&gt;/&lt;REPO_CỦA_BẠN&gt;.git
git push -u origin main</code></pre>

                <p><strong>Bước 2: Cấu hình GitHub Actions Secrets</strong></p>
                <p>Truy cập vào trang Repository của bạn trên GitHub, chọn <strong>Settings</strong> > <strong>Secrets and variables</strong> > <strong>Actions</strong>. Bạn cần thêm 2 biến Secret sau để GitHub có quyền truy cập vào AWS của bạn:</p>
                <ul>
                    <li><code>AWS_ACCESS_KEY_ID</code>: Key ID tài khoản IAM của bạn.</li>
                    <li><code>AWS_SECRET_ACCESS_KEY</code>: Secret Key tài khoản IAM của bạn.</li>
                </ul>

                <p><strong>Bước 3: Tận hưởng sự tự động hóa</strong></p>
                <p>Từ bây giờ, mỗi khi bạn commit và push code lên nhánh <code>main</code>, GitHub Actions sẽ tự động kích hoạt. Nó sẽ tự động format code, quét bảo mật Trivy, build Docker Images, chạy Terraform để cấp phát hạ tầng, và deploy lên ECS Fargate cùng AWS Lambda. Thật sự là rảnh tay!</p>

                <h2>Lời Kết</h2>
                <p>Việc kết hợp giữa kiến trúc Container (ECS), Serverless (SAM) và tự động hoá với Terraform đem lại một hệ thống cực kỳ bền vững, dễ dàng nâng cấp. Nếu gặp khó khăn ở bước nào, hãy mở một Issue trên GitHub repo nhé, mình sẽ hỗ trợ nhiệt tình!</p>
            </div>
        </article>

    </div>
</body>
</html>',NULL,'2026-06-08 17:55:35.843'),(9,'Kubernetes CRD & Argo CD Application CRD Deep Dive','Tìm hiểu chuyên sâu về Kubernetes Custom Resource Definition (CRD), Controller Pattern và cách Argo CD sử dụng Application CRD để triển khai GitOps. Bài viết giải thích chi tiết từ cơ chế hoạt động bên trong Kubernetes đến kiến trúc Production với AppProject, ApplicationSet và App-of-Apps.','<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kubernetes CRD & Argo CD Application CRD Deep Dive</title>
    <style>
        :root {
            --bg-color: #f8fafc;
            --text-color: #334155;
            --heading-color: #0f172a;
            --primary-color: #2563eb;
            --secondary-color: #3b82f6;
            --card-bg: #ffffff;
            --border-color: #e2e8f0;
            --tag-bg: #eff6ff;
            --tag-text: #1d4ed8;
        }

        body {
            font-family: ''Inter'', -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: var(--text-color);
            background-color: var(--bg-color);
            margin: 0;
            padding: 0;
        }

        .container {
            max-width: 100%;
            padding: 2rem;
        }

        header {
            text-align: left;
            margin-bottom: 3rem;
        }

        h1 {
            color: var(--heading-color);
            font-size: 2.5rem;
            margin-bottom: 0.5rem;
        }

        .subtitle {
            color: #64748b;
            font-size: 1.1rem;
        }

        .blog-post {
            margin-bottom: 4rem;
            padding-bottom: 2rem;
            border-bottom: 1px solid var(--border-color);
        }

        .post-date {
            color: #94a3b8;
            font-size: 0.9rem;
            font-weight: 500;
            margin-bottom: 1rem;
            display: block;
        }

        .post-title {
            color: var(--heading-color);
            font-size: 2rem;
            margin-top: 0;
            margin-bottom: 1rem;
            line-height: 1.3;
        }

        .tags {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
            margin-bottom: 1.5rem;
        }

        .tag {
            background-color: var(--tag-bg);
            color: var(--tag-text);
            padding: 0.25rem 0.75rem;
            border-radius: 9999px;
            font-size: 0.85rem;
            font-weight: 600;
        }

        .post-content {
            font-size: 1.05rem;
        }

        .post-content h2 {
            color: var(--heading-color);
            margin-top: 2.5rem;
            margin-bottom: 1rem;
            border-bottom: 1px solid var(--border-color);
            padding-bottom: 0.5rem;
        }

        .post-content h3 {
            color: var(--heading-color);
            margin-top: 2rem;
            margin-bottom: 1rem;
        }

        .post-content p {
            margin-bottom: 1.2rem;
        }

        .post-content ul {
            margin-bottom: 1.5rem;
            padding-left: 1.5rem;
        }

        .post-content li {
            margin-bottom: 0.5rem;
        }

        code {
            background-color: #f1f5f9;
            color: #ef4444;
            padding: 0.2rem 0.4rem;
            border-radius: 4px;
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
            font-size: 0.9em;
        }
        
        pre {
            background-color: #1e293b;
            color: #f8fafc;
            padding: 1rem;
            border-radius: 6px;
            overflow-x: auto;
            margin-bottom: 1.5rem;
        }
        
        pre code {
            background-color: transparent;
            color: inherit;
            padding: 0;
            font-size: 0.9em;
        }

        .note {
            border-left: 4px solid var(--primary-color);
            background: #eff6ff;
            padding: 1rem 1.25rem;
            margin: 1.5rem 0;
            border-radius: 0 6px 6px 0;
        }

        .warning {
            border-left: 4px solid #f97316;
            background: #fff7ed;
            padding: 1rem 1.25rem;
            margin: 1.5rem 0;
            border-radius: 0 6px 6px 0;
        }

        .footer {
            text-align: center;
            margin-top: 4rem;
            padding-top: 2rem;
            border-top: 1px solid var(--border-color);
            color: #64748b;
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>Tech Blog & Case Studies</h1>
            <p class="subtitle">Chia sẻ kiến thức về DevOps, Kubernetes, GitOps & Platform Engineering</p>
        </header>

        <article class="blog-post">
            <time class="post-date">Tháng 6, 2026</time>
            <h2 class="post-title">Kubernetes CRD Explained: Từ Custom Resource đến Argo CD Application CRD trong GitOps</h2>
            <div class="tags">
                <span class="tag">Kubernetes</span>
                <span class="tag">CRD</span>
                <span class="tag">Controller</span>
                <span class="tag">Argo CD</span>
                <span class="tag">GitOps</span>
                <span class="tag">Platform Engineering</span>
            </div>

            <div class="post-content">
                <p>Khi mới học Kubernetes, chúng ta thường bắt đầu với các resource quen thuộc như <code>Pod</code>, <code>Deployment</code>, <code>Service</code>, <code>ConfigMap</code> hay <code>Secret</code>. Nhưng khi đi sâu hơn vào hệ sinh thái Kubernetes, bạn sẽ gặp rất nhiều resource lạ như <code>Application</code> của Argo CD, <code>Certificate</code> của cert-manager, <code>ExternalSecret</code> của External Secrets Operator, hoặc <code>Prometheus</code> của Prometheus Operator. Những resource này không có sẵn trong Kubernetes ban đầu. Chúng tồn tại nhờ một cơ chế cực kỳ quan trọng: <strong>Custom Resource Definition</strong>, thường gọi ngắn là <strong>CRD</strong>.</p>

                <p>Bài viết này sẽ giải thích CRD theo hướng thực chiến DevOps: CRD là gì, vì sao Kubernetes cần CRD, Controller liên quan như thế nào, Operator Pattern là gì, và cuối cùng là cách Argo CD dùng <code>Application CRD</code> để biến Git repository thành nguồn sự thật cho Kubernetes cluster.</p>

                <h2>Phần 1: Kubernetes Resource là gì?</h2>
                <p>Trong Kubernetes, mọi thứ bạn tạo ra đều được biểu diễn dưới dạng resource. Ví dụ khi bạn muốn chạy một ứng dụng Nginx, bạn thường viết một file YAML như sau:</p>

<pre><code>apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx
  namespace: demo
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
        - name: nginx
          image: nginx:1.25
          ports:
            - containerPort: 80</code></pre>

                <p>Khi chạy lệnh:</p>

<pre><code>kubectl apply -f deployment.yaml</code></pre>

                <p><code>kubectl</code> gửi YAML này đến Kubernetes API Server. API Server kiểm tra xem resource này có hợp lệ không, sau đó lưu trạng thái mong muốn vào <code>etcd</code>. Từ đây, Kubernetes Controller sẽ quan sát và hành động để trạng thái thực tế trong cluster khớp với trạng thái mong muốn.</p>

                <div class="note">
                    <strong>Ý tưởng cốt lõi:</strong> Kubernetes không đơn giản là chạy lệnh một lần rồi thôi. Kubernetes hoạt động theo mô hình desired state. Bạn khai báo "tôi muốn gì", còn Kubernetes liên tục cố gắng làm cho cluster trở thành đúng như vậy.
                </div>

                <h3>Built-in Resource</h3>
                <p>Các resource như <code>Pod</code>, <code>Deployment</code>, <code>Service</code>, <code>ConfigMap</code>, <code>Secret</code>, <code>Namespace</code> là các resource có sẵn trong Kubernetes. Bạn có thể xem danh sách này bằng:</p>

<pre><code>kubectl api-resources</code></pre>

                <p>Mỗi resource có một schema riêng. Schema này nói cho Kubernetes biết field nào hợp lệ, field nào bắt buộc, field nào sai, và resource đó thuộc API group nào.</p>

                <h2>Phần 2: CRD là gì?</h2>
                <p><strong>CRD</strong> là viết tắt của <strong>Custom Resource Definition</strong>. Đây là cách để mở rộng Kubernetes bằng cách thêm một loại resource mới mà Kubernetes ban đầu không có.</p>

                <p>Ví dụ Kubernetes mặc định không biết resource này:</p>

<pre><code>apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: frontend-prod
  namespace: argocd</code></pre>

                <p>Nếu chưa cài Argo CD mà bạn apply file trên, Kubernetes sẽ báo lỗi kiểu:</p>

<pre><code>error: resource mapping not found for name: "frontend-prod" namespace: "argocd"
no matches for kind "Application" in version "argoproj.io/v1alpha1"</code></pre>

                <p>Lý do là Kubernetes chưa biết <code>kind: Application</code> là gì. Sau khi cài Argo CD, Argo CD sẽ cài thêm CRD vào cluster. Lúc đó Kubernetes bắt đầu hiểu resource mới tên là <code>Application</code>.</p>

                <p>Bạn có thể kiểm tra bằng:</p>

<pre><code>kubectl api-resources | grep argoproj</code></pre>

                <p>Kết quả thường có dạng:</p>

<pre><code>applications        app,apps        argoproj.io/v1alpha1
applicationsets     appset          argoproj.io/v1alpha1
appprojects         appproj         argoproj.io/v1alpha1</code></pre>

                <h3>CRD giúp Kubernetes hiểu thêm ngôn ngữ mới</h3>
                <p>Có thể hiểu đơn giản:</p>

                <ul>
                    <li><strong>Deployment</strong> là ngôn ngữ built-in của Kubernetes.</li>
                    <li><strong>Application</strong> là ngôn ngữ do Argo CD thêm vào Kubernetes.</li>
                    <li><strong>Certificate</strong> là ngôn ngữ do cert-manager thêm vào Kubernetes.</li>
                    <li><strong>ExternalSecret</strong> là ngôn ngữ do External Secrets Operator thêm vào Kubernetes.</li>
                </ul>

                <h2>Phần 3: CRD khác Custom Resource như thế nào?</h2>
                <p>Đây là điểm rất nhiều bạn bị nhầm.</p>

                <ul>
                    <li><strong>CRD</strong> là định nghĩa loại resource mới.</li>
                    <li><strong>Custom Resource</strong> là object cụ thể được tạo ra từ CRD đó.</li>
                </ul>

                <p>Ví dụ Argo CD cài CRD tên là <code>applications.argoproj.io</code>. Sau đó bạn tạo một custom resource cụ thể:</p>

<pre><code>apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: hospital-frontend-prod
  namespace: argocd
spec:
  source:
    repoURL: https://github.com/Kien-devops/k8s-home.git
    targetRevision: main
    path: deploy/workloads/hospital-frontend/overlays/prod
  destination:
    server: https://kubernetes.default.svc
    namespace: hospital-prod</code></pre>

                <p>Trong ví dụ này:</p>

                <ul>
                    <li><code>applications.argoproj.io</code> là CRD.</li>
                    <li><code>hospital-frontend-prod</code> là custom resource thuộc kind <code>Application</code>.</li>
                </ul>

                <h2>Phần 4: Controller là gì?</h2>
                <p>CRD chỉ làm cho Kubernetes hiểu và lưu được một resource mới. Nhưng CRD tự nó không làm gì cả. Muốn resource mới có hành vi thật, cần có <strong>Controller</strong>.</p>

                <p>Controller là một process chạy liên tục trong cluster. Nó quan sát Kubernetes API, đọc desired state, so sánh với actual state, rồi thực hiện hành động để reconcile.</p>

<pre><code>Desired State trong Kubernetes API
        |
        v
Controller quan sát
        |
        v
So sánh với trạng thái thực tế
        |
        v
Tạo / sửa / xóa resource để khớp desired state</code></pre>

                <h3>Ví dụ với Deployment Controller</h3>
                <p>Khi bạn tạo Deployment với <code>replicas: 3</code>, Deployment Controller sẽ đảm bảo luôn có 3 Pod chạy. Nếu một Pod chết, controller tạo Pod mới. Nếu có quá nhiều Pod, controller xóa bớt.</p>

                <p>Đó là reconciliation loop:</p>

<pre><code>Observe → Compare → Act → Repeat</code></pre>

                <div class="note">
                    <strong>Senior DevOps mindset:</strong> Kubernetes mạnh không phải vì YAML, mà vì Controller. YAML chỉ mô tả mong muốn. Controller mới là thành phần biến mong muốn đó thành hiện thực.
                </div>

                <h2>Phần 5: Operator Pattern</h2>
                <p>Khi một hệ thống dùng CRD kết hợp với Controller, chúng ta thường gọi đó là <strong>Operator Pattern</strong>.</p>

                <p>Công thức dễ nhớ:</p>

<pre><code>Operator = CRD + Controller + Domain Logic</code></pre>

                <p>Ví dụ:</p>

                <ul>
                    <li><strong>Argo CD</strong>: Application CRD + Application Controller.</li>
                    <li><strong>cert-manager</strong>: Certificate CRD + cert-manager controller.</li>
                    <li><strong>Prometheus Operator</strong>: Prometheus CRD + Prometheus controller.</li>
                    <li><strong>External Secrets Operator</strong>: ExternalSecret CRD + External Secrets controller.</li>
                </ul>

                <h2>Phần 6: Argo CD Application CRD là gì?</h2>
                <p><code>Application</code> là một CRD của Argo CD. Nó không phải là frontend, backend hay service đang chạy. Nó là một Kubernetes custom resource dùng để mô tả:</p>

                <ul>
                    <li>Argo CD cần lấy manifest từ Git repo nào.</li>
                    <li>Lấy branch, tag hoặc commit nào.</li>
                    <li>Lấy folder nào trong repo.</li>
                    <li>Deploy vào cluster nào.</li>
                    <li>Deploy vào namespace nào.</li>
                    <li>Sync thủ công hay tự động.</li>
                    <li>Có tự xóa resource thừa không.</li>
                    <li>Có tự sửa drift không.</li>
                </ul>

                <h3>Ví dụ Application CRD production</h3>

<pre><code>apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: hospital-backend-prod
  namespace: argocd
  labels:
    app.kubernetes.io/name: hospital-backend
    app.kubernetes.io/component: backend
    app.kubernetes.io/part-of: hospital-platform
    environment: prod
spec:
  project: hospital

  source:
    repoURL: https://github.com/Kien-devops/k8s-home.git
    targetRevision: main
    path: deploy/workloads/hospital-backend/overlays/prod

  destination:
    server: https://kubernetes.default.svc
    namespace: hospital-prod

  syncPolicy:
    automated:
      prune: true
      selfHeal: true
    syncOptions:
      - CreateNamespace=true
      - ApplyOutOfSyncOnly=true
      - PruneLast=true

  revisionHistoryLimit: 10</code></pre>

                <h2>Phần 7: Giải thích từng field trong Application</h2>

                <h3><code>apiVersion</code></h3>
<pre><code>apiVersion: argoproj.io/v1alpha1</code></pre>
                <p>Field này nói resource thuộc API group của Argo CD. Nếu CRD của Argo CD chưa được cài, Kubernetes sẽ không hiểu API version này.</p>

                <h3><code>kind</code></h3>
<pre><code>kind: Application</code></pre>
                <p>Đây là loại resource mà Argo CD Application Controller sẽ quan sát.</p>

                <h3><code>metadata.name</code></h3>
<pre><code>metadata:
  name: hospital-backend-prod</code></pre>
                <p>Đây là tên Application trong Argo CD UI và CLI. Tên này giúp phân biệt Application, nhưng không quyết định nội dung deploy. Nội dung deploy do <code>spec.source</code> quyết định.</p>

                <h3><code>metadata.namespace</code></h3>
<pre><code>namespace: argocd</code></pre>
                <p>Application object thường được tạo trong namespace <code>argocd</code>, nơi Argo CD control plane đang chạy. Điều này không có nghĩa workload thật cũng chạy trong namespace <code>argocd</code>.</p>

                <h3><code>spec.project</code></h3>
<pre><code>project: hospital</code></pre>
                <p><code>AppProject</code> là boundary bảo mật của Argo CD. Nó giới hạn repo nào được dùng, namespace nào được deploy, resource nào được phép tạo. Production không nên dùng mãi project <code>default</code>.</p>

                <h3><code>spec.source</code></h3>
<pre><code>source:
  repoURL: https://github.com/Kien-devops/k8s-home.git
  targetRevision: main
  path: deploy/workloads/hospital-backend/overlays/prod</code></pre>
                <p>Đây là nguồn desired state. Argo CD sẽ clone repo, checkout revision, rồi render manifest trong path được chỉ định.</p>

                <h3><code>spec.destination</code></h3>
<pre><code>destination:
  server: https://kubernetes.default.svc
  namespace: hospital-prod</code></pre>
                <p>Đây là nơi deploy. <code>https://kubernetes.default.svc</code> nghĩa là cluster nội bộ nơi Argo CD đang chạy. Namespace <code>hospital-prod</code> là nơi resource thật được apply.</p>

                <h3><code>syncPolicy</code></h3>
<pre><code>syncPolicy:
  automated:
    prune: true
    selfHeal: true</code></pre>
                <p><code>automated</code> bật auto-sync. <code>prune</code> cho phép xóa resource khỏi cluster khi resource bị xóa khỏi Git. <code>selfHeal</code> giúp Argo CD sửa lại nếu ai đó chỉnh tay trong cluster khiến live state lệch khỏi Git.</p>

                <h2>Phần 8: Argo CD đồng bộ từ Git về cluster như thế nào?</h2>

                <p>Luồng hoạt động thực tế:</p>

<pre><code>Developer push code
        |
        v
CI build Docker image
        |
        v
Push image to registry
        |
        v
Update GitOps manifest
        |
        v
Argo CD Repo Server render manifest
        |
        v
Application Controller compare desired vs live
        |
        v
Sync Engine apply to Kubernetes API
        |
        v
Kubernetes controllers rollout workloads
        |
        v
Pods running</code></pre>

                <p>Argo CD không trực tiếp "chạy container". Nó chỉ apply Kubernetes manifest. Sau đó Kubernetes Deployment Controller, ReplicaSet Controller, Scheduler, Kubelet mới là các thành phần thật sự tạo Pod và chạy container.</p>

                <h2>Phần 9: Argo CD phân biệt nhiều app như thế nào?</h2>
                <p>Giả sử bạn có frontend, backend và payment service. Cách chuẩn là mỗi service có một folder manifest riêng và một Argo CD Application riêng.</p>

<pre><code>gitops-repo/
├── deploy/
│   ├── workloads/
│   │   ├── hospital-frontend/
│   │   │   └── overlays/prod/
│   │   ├── hospital-backend/
│   │   │   └── overlays/prod/
│   │   └── payment-service/
│   │       └── overlays/prod/
│   └── argocd/
│       └── applications/
│           └── workloads/
│               ├── hospital-frontend-prod.yaml
│               ├── hospital-backend-prod.yaml
│               └── payment-service-prod.yaml</code></pre>

                <p>Argo CD phân biệt bằng:</p>

                <ul>
                    <li><code>metadata.name</code>: tên Application trong Argo CD.</li>
                    <li><code>spec.source.repoURL</code>: repo Git.</li>
                    <li><code>spec.source.path</code>: folder manifest.</li>
                    <li><code>spec.destination.server</code>: cluster đích.</li>
                    <li><code>spec.destination.namespace</code>: namespace đích.</li>
                </ul>

                <div class="warning">
                    <strong>Lưu ý quan trọng:</strong> Argo CD không deploy theo tên app. Tên app chỉ là ID quản lý. Thứ quyết định deploy cái gì là <code>source</code>. Thứ quyết định deploy đi đâu là <code>destination</code>.
                </div>

                <h2>Phần 10: Sync Status và Health Status</h2>

                <p>Argo CD có hai loại trạng thái rất quan trọng:</p>

                <h3>Sync Status</h3>
                <p>Sync status trả lời câu hỏi: live state trong cluster có giống desired state trong Git không?</p>

                <ul>
                    <li><strong>Synced</strong>: Git và cluster giống nhau.</li>
                    <li><strong>OutOfSync</strong>: Git và cluster đang lệch nhau.</li>
                    <li><strong>Unknown</strong>: Argo CD chưa xác định được trạng thái.</li>
                </ul>

                <h3>Health Status</h3>
                <p>Health status trả lời câu hỏi: resource chạy có khỏe không?</p>

                <ul>
                    <li><strong>Healthy</strong>: app chạy ổn.</li>
                    <li><strong>Progressing</strong>: đang rollout.</li>
                    <li><strong>Degraded</strong>: app có lỗi.</li>
                    <li><strong>Missing</strong>: resource trong Git có nhưng cluster chưa có.</li>
                </ul>

                <p>Ví dụ nếu Git có image sai:</p>

<pre><code>image: hospital-backend:not-found</code></pre>

                <p>Argo CD vẫn có thể báo:</p>

<pre><code>Sync Status: Synced
Health Status: Degraded</code></pre>

                <p>Nghĩa là Argo CD đã apply đúng manifest trong Git, nhưng app chạy lỗi.</p>

                <h2>Phần 11: AppProject trong Argo CD</h2>

                <p>Production không nên để tất cả Application dùng project <code>default</code>. AppProject giúp tạo boundary cho team và environment.</p>

<pre><code>apiVersion: argoproj.io/v1alpha1
kind: AppProject
metadata:
  name: hospital
  namespace: argocd
spec:
  description: Hospital application workloads

  sourceRepos:
    - https://github.com/Kien-devops/k8s-home.git

  destinations:
    - server: https://kubernetes.default.svc
      namespace: hospital-*

  namespaceResourceWhitelist:
    - group: ""
      kind: Service
    - group: ""
      kind: ConfigMap
    - group: apps
      kind: Deployment
    - group: networking.k8s.io
      kind: Ingress
    - group: networking.k8s.io
      kind: NetworkPolicy</code></pre>

                <p>Với cấu hình này, các Application thuộc project <code>hospital</code> chỉ được deploy vào namespace bắt đầu bằng <code>hospital-</code>, chỉ được lấy manifest từ repo được cho phép, và chỉ được tạo những resource đã whitelist.</p>

                <h2>Phần 12: App of Apps Pattern</h2>

                <p>Khi số lượng Application tăng lên, bạn không nên apply thủ công từng file:</p>

<pre><code>kubectl apply -f hospital-frontend-prod.yaml
kubectl apply -f hospital-backend-prod.yaml
kubectl apply -f prometheus.yaml
kubectl apply -f loki.yaml</code></pre>

                <p>Thay vào đó, dùng một root Application để quản lý các child Application.</p>

<pre><code>apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: cluster-bootstrap
  namespace: argocd
spec:
  project: default

  source:
    repoURL: https://github.com/Kien-devops/k8s-home.git
    targetRevision: main
    path: deploy/argocd

  destination:
    server: https://kubernetes.default.svc
    namespace: argocd

  syncPolicy:
    automated:
      prune: true
      selfHeal: true</code></pre>

                <p>Sau đó bạn chỉ cần apply một lần:</p>

<pre><code>kubectl apply -f deploy/argocd/bootstrap/root-application.yaml</code></pre>

                <p>Từ đó về sau, Argo CD tự quản lý các Application con.</p>

                <h2>Phần 13: Kustomize và CRD trong GitOps</h2>

                <p>Với GitOps production, bạn không nên để tất cả manifest trong một folder lớn. Nên tách base và overlay.</p>

<pre><code>deploy/workloads/hospital-backend/
├── base/
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── network-policy.yaml
│   └── kustomization.yaml
└── overlays/
    ├── dev/
    │   ├── kustomization.yaml
    │   └── patch-deployment.yaml
    └── prod/
        ├── kustomization.yaml
        └── patch-deployment.yaml</code></pre>

                <p>Base chứa cấu hình chung. Overlay chứa khác biệt giữa môi trường dev, staging, prod.</p>

                <h3>Overlay prod ví dụ</h3>

<pre><code>apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

namespace: hospital-prod

resources:
  - ../../base

patches:
  - path: patch-deployment.yaml

images:
  - name: hospital-backend
    newName: 100.112.150.56:8082/hospital-backend
    newTag: sha-abc1234</code></pre>

                <p>CI/CD chỉ cần update <code>newTag</code> trong overlay. Không nên sửa thẳng file <code>deployment.yaml</code> trong base.</p>

                <h2>Phần 14: Những lỗi thường gặp khi dùng CRD và Argo CD</h2>

                <ul>
                    <li><strong>Apply Custom Resource trước khi CRD tồn tại:</strong> Kubernetes sẽ báo không biết kind đó.</li>
                    <li><strong>Dùng một Application khổng lồ:</strong> frontend lỗi kéo theo backend, monitoring, logging cùng một trạng thái.</li>
                    <li><strong>Dùng project default cho mọi thứ:</strong> không có boundary bảo mật.</li>
                    <li><strong>Sửa tay resource trong cluster:</strong> tạo drift với Git.</li>
                    <li><strong>Hai Application quản lý cùng một resource:</strong> gây shared resource warning và khó debug.</li>
                    <li><strong>Hardcode namespace trong base:</strong> làm manifest khó tái sử dụng cho dev/prod.</li>
                    <li><strong>CI sửa deployment.yaml trực tiếp:</strong> làm base mất tính trung lập môi trường.</li>
                </ul>

                <h2>Phần 15: Checklist Senior DevOps</h2>

                <ul>
                    <li>Mỗi deployable unit có một Argo CD Application riêng.</li>
                    <li>Mỗi workload có base và overlay riêng.</li>
                    <li>Không dùng <code>default</code> project cho production workload.</li>
                    <li>Dùng AppProject để giới hạn source repo, namespace và resource.</li>
                    <li>Dùng App of Apps hoặc ApplicationSet để bootstrap cluster.</li>
                    <li>Dùng image tag bất biến, tốt hơn nữa là image digest.</li>
                    <li>CI cập nhật overlay, không sửa base.</li>
                    <li>Không sửa tay resource trong cluster.</li>
                    <li>Kiểm tra manifest bằng <code>kustomize build</code>, <code>kubeconform</code>, <code>yamllint</code>.</li>
                    <li>Thiết kế folder theo ownership: workloads, platform, argocd, infrastructure, docs.</li>
                </ul>

                <h2>Lời kết</h2>
                <p>CRD là một trong những lý do khiến Kubernetes trở thành nền tảng mạnh mẽ cho Cloud Native và Platform Engineering. Nhờ CRD, Kubernetes không chỉ quản lý Pod hay Service, mà còn có thể quản lý certificate, secret, monitoring stack, security policy, GitOps application và rất nhiều hệ thống phức tạp khác.</p>

                <p>Argo CD Application CRD là một ví dụ rất thực tế: nó biến Git repository thành desired state, Application Controller liên tục so sánh Git với cluster, và Kubernetes trở thành nơi tự động reconcile hạ tầng ứng dụng. Khi hiểu rõ CRD, Controller và reconciliation loop, bạn sẽ không còn xem Argo CD như một công cụ "magic", mà sẽ hiểu chính xác tại sao GitOps hoạt động và cách thiết kế nó ở level Senior DevOps.</p>
            </div>
        </article>

        <div class="footer">
            <p>© 2026 DevOps & Platform Engineering Blog. Built for learning, architecture and hands-on practice.</p>
        </div>
    </div>
</body>
</html>
',NULL,'2026-06-26 15:19:55.480');

INSERT INTO [dbo].[project_details] ([id],[project_id],[icon],[detail_title],[detail_description]) VALUES (1,1,'fa-solid fa-route','Traffic Routing','Internet requests navigate through an external HAProxy Edge Load Balancer, forwarding into a Kubernetes Traefik Gateway API, exposing isolated Frontend and Backend service endpoints.'),(2,1,'fa-solid fa-server','Application Stack','Front-facing UI crafted in React 19 + Vite. Microservice backends run ASP.NET Core 9 API connecting securely to a Microsoft SQL Server database.'),(3,1,'fa-solid fa-shield','IaC & Bootstrapping','Terraform provisions AWS EC2 instances dynamically. Custom Ansible Playbooks configure dependencies, kernel parameters, and boot them into a private Kubernetes cluster.'),(4,1,'fa-solid fa-gears','Metric-driven Autoscaling','Prometheus watches system load. On threshold breaches, Alertmanager sends webhook alerts to a Python scaling daemon, which dynamically provisions and joins new worker nodes via Terraform & Ansible.'),(5,2,'fa-solid fa-shield-halved','DevSecOps Pipeline','Multi-stage GitHub Actions workflows enforce SonarQube quality gates, audit dependencies using Nexus, scan container layers via Trivy, and push to Amazon ECR.'),(6,2,'fa-brands fa-aws','EKS Infrastructure','Configured using modular Terraform modules. Implements IAM Roles for Service Accounts (IRSA/OIDC) for fine-grained pod access control and KMS-encrypted secrets.'),(7,2,'fa-solid fa-lock','Cluster Security Policies','Active runtime security audits using Falco. Custom Kyverno policies enforce non-root container constraints and block privilege escalation paths.'),(8,2,'fa-solid fa-chart-line','Centralized Observability','Real-time cluster state dashboarding. Centralized log shipping via Promtail into Loki, queried within Grafana, paired with custom Alertmanager triggers.'),(9,3,'fa-solid fa-server','Application Stack','Front-facing UI crafted in React 19 + Vite. Microservice backends run ASP.NET Core 9 API connecting securely to a Microsoft SQL Server database, integrated with a node-local standalone Redis DaemonSet for caching.'),(10,3,'fa-solid fa-shield-halved','DevSecOps Pipeline','Multi-stage GitHub Actions workflows restore dependencies through cached NuGet/npm groups in a local Nexus Repository, enforce SonarQube quality gates, perform Trivy filesystem scans, and archive build artifacts.'),(11,3,'fa-solid fa-shield','Supply Chain Security','A remote build host connected via a secure Tailscale VPN SSH link downloads the ZIP artifacts from Nexus, builds non-root alpine-based Docker images, performs Trivy image security scans (failing on HIGH or CRITICAL alerts), and pushes them to a local Nexus Docker Registry.'),(12,3,'fa-solid fa-route','GitOps Continuous Delivery','The workflow dynamically updates manifest image tags in Git. Argo CD monitors the Git repository as the single source of truth and automates declarative zero-drift sync to the self-hosted Kubernetes cluster.'),(13,3,'fa-solid fa-lock','Cluster Hardening & Security Policies','Enforces Kyverno policy baselines at the admission stage, tracks cluster-wide vulnerabilities via Trivy Operator reports, and implements Falco for real-time runtime security anomaly detection.'),(14,3,'fa-solid fa-chart-line','Observability & Logging','Centralized log collection is handled via Promtail shipping logs to Loki, while cluster-wide metrics are gathered by Prometheus Operator, and Alertmanager handles alert notifications, all queried and visualized on custom Grafana dashboards.');
INSERT INTO [dbo].[projects] ([id],[project_number],[title],[summary],[github_url],[tech_stack]) VALUES (1,'PROJECT 01','Hospital Platform CI/CD, GitOps, Kubernetes & Auto Scaling','A full-stack hospital management platform deployed through an automated DevOps pipeline featuring dynamic metric-driven infrastructure scaling.','https://github.com/Kien-devops/cicd-ecr-kube-ec2-gitaction.git','AWS EC2, Kubernetes, HAProxy, Traefik API, Terraform, Ansible, Argo CD, Prometheus'),(2,'PROJECT 02','Hospital EKS DevSecOps GitOps Platform','An end-to-end cloud platform demonstrating EKS cluster hardening, multi-gate security scanning, and declarative zero-drift deployments.','https://github.com/Kien-devops/eks-cicd-argocd-sec-monitor.git','AWS EKS, Argo CD, SonarQube, Trivy, Kyverno, Falco, Loki / Promtail, Terraform'),(3,'PROJECT 03','Hospital On-Premise DevSecOps GitOps Platform','An end-to-end self-hosted on-premise Kubernetes platform demonstrating multi-layer security scanning, dependency caching, GitOps continuous delivery, and full-stack observability.','https://github.com/Kien-devops/k8s-home.git','Kubernetes (On-Premise), Argo CD, Nexus Repository, SonarQube, Trivy, Tailscale, Kyverno, Falco, Loki / Promtail, HAProxy / Traefik');

DROP TABLE IF EXISTS [dbo].[study_comments];
DROP TABLE IF EXISTS [dbo].[study_lessons];
DROP TABLE IF EXISTS [dbo].[studies];

CREATE TABLE [dbo].[studies] (
    [id] INT IDENTITY(1,1) PRIMARY KEY,
    [title] NVARCHAR(255) NOT NULL,
    [summary] NVARCHAR(MAX) NOT NULL,
    [content] NVARCHAR(MAX) NOT NULL,
    [image_url] NVARCHAR(MAX) NULL,
    [category] NVARCHAR(100) NULL,
    [created_at] DATETIME DEFAULT GETDATE()
);

CREATE TABLE [dbo].[study_lessons] (
    [id] INT IDENTITY(1,1) PRIMARY KEY,
    [study_id] INT NOT NULL,
    [title] NVARCHAR(255) NOT NULL,
    [video_url] NVARCHAR(MAX) NOT NULL,
    [duration] NVARCHAR(50) NULL,
    [order_num] INT NOT NULL,
    CONSTRAINT [FK_study_lessons_studies] FOREIGN KEY ([study_id]) 
      REFERENCES [dbo].[studies]([id]) ON DELETE CASCADE
);

CREATE TABLE [dbo].[study_comments] (
    [comment_id] NVARCHAR(255) PRIMARY KEY,
    [study_id] INT NOT NULL,
    [parent_comment_id] NVARCHAR(255) NULL,
    [type] NVARCHAR(50) NOT NULL,
    [author_name] NVARCHAR(255) NOT NULL,
    [author_email] NVARCHAR(255) NOT NULL,
    [author_email_hash] NVARCHAR(64) NULL,
    [content] NVARCHAR(MAX) NOT NULL,
    [created_at] DATETIME NOT NULL DEFAULT GETDATE(),
    [reply_count] INT NOT NULL DEFAULT 0,
    [status] NVARCHAR(50) NOT NULL DEFAULT 'approved',
    CONSTRAINT [FK_study_comments_studies] FOREIGN KEY ([study_id]) 
      REFERENCES [dbo].[studies]([id]) ON DELETE CASCADE
);

SET IDENTITY_INSERT [dbo].[studies] ON;
INSERT INTO [dbo].[studies] ([id], [title], [summary], [content], [image_url], [category], [created_at]) VALUES 
(1, 'Docker Containerization for Beginners', 'Learn how to write efficient Dockerfiles, manage image builds, and pick secure alpine/distroless base images to optimize container deployments.', 'This free Udemy course walks you through the fundamentals of Docker containerization. You will learn to write container blueprints, setup local Dev environments, build small size production images, and link services together using Docker Compose.', 'fa-solid fa-box-open', 'Docker', '2026-06-27 12:00:00.000'),
(2, 'Kubernetes Cluster Orchestration', 'A deep dive into Kubernetes container network interface, scheduling primitives, cluster architecture components, and security policies.', 'Dive deep into container orchestration. This course covers Kubernetes cluster architecture (Control Plane and Nodes), workload controllers (Pods, Deployments, ReplicaSets), services routing, and securing network access boundaries.', 'fa-solid fa-network-wired', 'Kubernetes', '2026-06-27 12:05:00.000'),
(3, 'Terraform Infrastructure as Code', 'Avoid state corruption in shared teams. Learn how to store state securely in AWS S3 and lock state executions using DynamoDB tables.', 'Understand state management, remote backends, modules structure, and variables definitions in Terraform to orchestrate cloud infrastructures in a secure and reproducible way.', 'fa-solid fa-code', 'CI/CD', '2026-06-27 12:10:00.000');
SET IDENTITY_INSERT [dbo].[studies] OFF;

INSERT INTO [dbo].[study_lessons] (study_id, title, video_url, duration, order_num) VALUES
(1, '1. Introduction to Containers & Docker', 'https://www.youtube.com/watch?v=fqMOX6JJhGo', '10:15', 1),
(1, '2. Writing Your First Dockerfile', 'https://www.youtube.com/watch?v=3c-iKn5q1Fs', '14:22', 2),
(1, '3. Docker Compose Multi-Container Setup', 'https://www.youtube.com/watch?v=Qw9zlE3t8Ko', '18:45', 3),
(2, '1. Kubernetes Architecture Explained', 'https://www.youtube.com/watch?v=VnvRFRk_51k', '12:40', 1),
(2, '2. Deployments, Pods and Services', 'https://www.youtube.com/watch?v=T4Z75qy07kY', '16:10', 2),
(2, '3. ConfigMaps and Secrets Configuration', 'https://www.youtube.com/watch?v=MTn_IpC4P1k', '11:55', 3),
(3, '1. Terraform Basics & Providers', 'https://www.youtube.com/watch?v=h970ZzbhxT4', '09:30', 1),
(3, '2. Managing Terraform State Remote Backend', 'https://www.youtube.com/watch?v=YGP9jH_UynY', '15:15', 2);
