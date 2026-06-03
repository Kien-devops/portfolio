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
      --bg: #f4f7fb;
      --card: #ffffff;
      --text: #172033;
      --muted: #64748b;
      --primary: #2563eb;
      --primary-dark: #1d4ed8;
      --border: #e2e8f0;
      --code-bg: #0f172a;
      --code-text: #e5e7eb;
      --soft-blue: #eff6ff;
    }

    * { box-sizing: border-box; }

    body {
      margin: 0;
      font-family: Arial, Helvetica, sans-serif;
      background: linear-gradient(135deg, #eef4ff 0%, #f8fafc 45%, #ffffff 100%);
      color: var(--text);
      line-height: 1.75;
    }

    .page {
      max-width: 1050px;
      margin: 0 auto;
      padding: 32px 18px 64px;
    }

    .hero {
      background: linear-gradient(135deg, #1e3a8a, #2563eb);
      color: white;
      border-radius: 26px;
      padding: 44px 34px;
      box-shadow: 0 22px 55px rgba(37, 99, 235, 0.25);
      margin-bottom: 28px;
    }

    .hero .badge {
      display: inline-block;
      background: rgba(255,255,255,0.16);
      border: 1px solid rgba(255,255,255,0.25);
      padding: 7px 13px;
      border-radius: 999px;
      font-size: 14px;
      margin-bottom: 16px;
    }

    .hero h1 {
      margin: 0 0 14px;
      font-size: clamp(30px, 5vw, 52px);
      line-height: 1.12;
      letter-spacing: -0.04em;
    }

    .hero p {
      margin: 0;
      max-width: 760px;
      color: #dbeafe;
      font-size: 18px;
    }

    .content {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 26px;
      padding: 32px;
      box-shadow: 0 18px 50px rgba(15, 23, 42, 0.08);
    }

    h2 {
      margin-top: 42px;
      margin-bottom: 14px;
      font-size: 30px;
      line-height: 1.25;
      color: #0f172a;
      border-left: 5px solid var(--primary);
      padding-left: 14px;
    }

    h3 {
      margin-top: 28px;
      margin-bottom: 10px;
      font-size: 22px;
      color: #1e3a8a;
    }

    p { margin: 14px 0; }

    ul {
      padding-left: 0;
      list-style: none;
      display: grid;
      gap: 10px;
      margin: 18px 0;
    }

    li {
      background: var(--soft-blue);
      border: 1px solid #bfdbfe;
      padding: 12px 14px;
      border-radius: 14px;
    }

    li::before {
      content: "✓";
      color: var(--primary);
      font-weight: bold;
      margin-right: 8px;
    }

    pre {
      background: var(--code-bg);
      color: var(--code-text);
      border-radius: 18px;
      padding: 18px;
      overflow-x: auto;
      box-shadow: inset 0 0 0 1px rgba(255,255,255,0.08);
      margin: 20px 0;
    }

    code {
      font-family: Consolas, Monaco, ''Courier New'', monospace;
      font-size: 14px;
    }

    p code, li code {
      background: #e0f2fe;
      color: #075985;
      padding: 2px 6px;
      border-radius: 7px;
    }

    figure {
      margin: 24px 0;
      border-radius: 22px;
      overflow: hidden;
      border: 1px solid var(--border);
      background: #fff;
    }

    figure img {
      width: 100%;
      display: block;
      max-height: 420px;
      object-fit: cover;
    }

    figcaption {
      color: var(--muted);
      font-size: 14px;
      padding: 10px 14px;
      background: #f8fafc;
    }

    .note {
      background: #ecfdf5;
      border: 1px solid #bbf7d0;
      border-left: 5px solid #22c55e;
      padding: 16px 18px;
      border-radius: 16px;
      margin: 24px 0;
    }

    @media (max-width: 720px) {
      .hero, .content { padding: 24px 18px; border-radius: 20px; }
      h2 { font-size: 24px; }
      h3 { font-size: 20px; }
    }
  </style>
</head>
<body>
  <main class="page">
    <section class="hero">
      <span class="badge">Kubernetes • HAProxy • AWS ALB • Zero Downtime</span>
      <h1>Graceful Shutdown và Zero Downtime Deployment</h1>
      <p>Hướng dẫn cách phối hợp application, Kubernetes, HAProxy và load balancer để tránh lỗi 502/503 khi rolling update.</p>
    </section>

    <article class="content">
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
    </article>
  </main>
</body>
</html>','https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1400&auto=format&fit=crop','2026-05-28 17:36:50.143'),(5,'Xây dựng hệ thống xử lý ảnh Event-Driven trên AWS','Trong bài viết này, chúng ta xây dựng pipeline serverless với S3, SQS, Lambda, DynamoDB Stream và SNS.','<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Xây dựng hệ thống xử lý ảnh Event-Driven trên AWS</title>
  <meta name="description" content="Trong bài viết này, chúng ta xây dựng pipeline serverless với S3, SQS, Lambda, DynamoDB Stream và SNS." />
  <style>
    :root {
      --bg: #f6f8fc;
      --card: #ffffff;
      --text: #172033;
      --muted: #5b6475;
      --primary: #2563eb;
      --primary-soft: #eff6ff;
      --border: #e5e7eb;
      --code-bg: #0f172a;
      --code-text: #e5e7eb;
      --success: #10b981;
      --warning: #f97316;
      --shadow: 0 18px 50px rgba(15, 23, 42, 0.10);
    }

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      font-family: Inter, "Segoe UI", Arial, sans-serif;
      line-height: 1.75;
      color: var(--text);
      background:
        radial-gradient(circle at top left, rgba(37, 99, 235, 0.14), transparent 32rem),
        linear-gradient(180deg, #f8fbff 0%, var(--bg) 100%);
    }

    .page {
      width: min(1120px, calc(100% - 32px));
      margin: 0 auto;
      padding: 36px 0 60px;
    }

    .hero {
      background: linear-gradient(135deg, #0f172a, #1d4ed8);
      color: white;
      padding: 44px;
      border-radius: 28px;
      box-shadow: var(--shadow);
      margin-bottom: 28px;
      overflow: hidden;
      position: relative;
    }

    .hero::after {
      content: "";
      position: absolute;
      width: 260px;
      height: 260px;
      border-radius: 999px;
      background: rgba(255,255,255,.13);
      right: -80px;
      top: -90px;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 7px 12px;
      border-radius: 999px;
      background: rgba(255,255,255,.14);
      border: 1px solid rgba(255,255,255,.25);
      font-weight: 700;
      font-size: 13px;
      margin-bottom: 18px;
    }

    .hero h1 {
      margin: 0;
      font-size: clamp(30px, 5vw, 54px);
      line-height: 1.12;
      letter-spacing: -0.04em;
      max-width: 900px;
    }

    .hero p {
      color: rgba(255,255,255,.86);
      max-width: 780px;
      font-size: 18px;
      margin: 18px 0 0;
    }

    .blog-content {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 28px;
      padding: clamp(22px, 4vw, 48px);
      box-shadow: var(--shadow);
    }

    .blog-content > h1 {
      display: none;
    }

    h2 {
      margin-top: 42px;
      padding-top: 16px;
      border-top: 1px solid var(--border);
      font-size: clamp(22px, 3vw, 31px);
      line-height: 1.25;
      letter-spacing: -0.02em;
      color: #0f172a;
    }

    h3 {
      margin-top: 28px;
      font-size: 21px;
      color: #1e3a8a;
    }

    p {
      color: var(--muted);
      margin: 14px 0;
    }

    ul {
      padding-left: 22px;
      color: var(--muted);
    }

    li {
      margin: 8px 0;
    }

    code {
      font-family: "Cascadia Code", "Fira Code", Consolas, monospace;
      font-size: .94em;
    }

    p code, li code {
      background: var(--primary-soft);
      color: #1d4ed8;
      padding: 2px 6px;
      border-radius: 7px;
      border: 1px solid #dbeafe;
    }

    pre {
      background: var(--code-bg) !important;
      color: var(--code-text) !important;
      padding: 18px 20px !important;
      border-radius: 16px !important;
      overflow: auto !important;
      box-shadow: inset 0 0 0 1px rgba(255,255,255,.07);
      line-height: 1.55;
      margin: 18px 0 24px !important;
    }

    pre code {
      color: inherit;
      background: transparent;
      border: 0;
      padding: 0;
      white-space: pre;
    }

    table {
      width: 100% !important;
      border-collapse: separate !important;
      border-spacing: 0 !important;
      overflow: hidden;
      border-radius: 16px;
      border: 1px solid var(--border);
      margin: 24px 0 !important;
    }

    th {
      background: #eef4ff !important;
      color: #0f172a;
      font-weight: 800;
    }

    th, td {
      border: 0 !important;
      border-bottom: 1px solid var(--border) !important;
      padding: 14px 16px !important;
      text-align: left;
      vertical-align: top;
    }

    tr:last-child td {
      border-bottom: 0 !important;
    }

    .footer-note {
      text-align: center;
      color: #64748b;
      font-size: 14px;
      margin-top: 26px;
    }

    @media (max-width: 720px) {
      .page {
        width: min(100% - 18px, 1120px);
        padding: 16px 0 36px;
      }

      .hero {
        padding: 28px 22px;
        border-radius: 22px;
      }

      .blog-content {
        border-radius: 22px;
      }

      table {
        display: block;
        overflow-x: auto;
      }
    }
  </style>
</head>
<body>
  <main class="page">
    <section class="hero">
      <div class="badge">AWS Serverless · Event-Driven Architecture</div>
      <h1>Xây dựng hệ thống xử lý ảnh Event-Driven trên AWS</h1>
      <p>Trong bài viết này, chúng ta xây dựng pipeline serverless với S3, SQS, Lambda, DynamoDB Stream và SNS.</p>
    </section>

    "<article class="blog-content">

  <h1>Xây dựng hệ thống xử lý ảnh Event-Driven trên AWS với S3, SQS, Lambda, DynamoDB Stream và SNS</h1>

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

  <div style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:16px;padding:24px;margin:24px 0;">
    <div style="display:flex;flex-direction:column;align-items:center;gap:12px;font-size:18px;font-weight:600;">
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

  <table style="width:100%;border-collapse:collapse;margin:24px 0;">
    <thead>
      <tr style="background:#f1f5f9;">
        <th style="border:1px solid #e5e7eb;padding:12px;text-align:left;">Dịch vụ</th>
        <th style="border:1px solid #e5e7eb;padding:12px;text-align:left;">Vai trò</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="border:1px solid #e5e7eb;padding:12px;">Amazon S3</td>
        <td style="border:1px solid #e5e7eb;padding:12px;">Lưu trữ ảnh upload</td>
      </tr>
      <tr>
        <td style="border:1px solid #e5e7eb;padding:12px;">Amazon SQS</td>
        <td style="border:1px solid #e5e7eb;padding:12px;">Hàng đợi trung gian để buffer event</td>
      </tr>
      <tr>
        <td style="border:1px solid #e5e7eb;padding:12px;">AWS Lambda #1</td>
        <td style="border:1px solid #e5e7eb;padding:12px;">Đọc message từ SQS và lưu metadata vào DynamoDB</td>
      </tr>
      <tr>
        <td style="border:1px solid #e5e7eb;padding:12px;">Amazon DynamoDB</td>
        <td style="border:1px solid #e5e7eb;padding:12px;">Lưu metadata của ảnh</td>
      </tr>
      <tr>
        <td style="border:1px solid #e5e7eb;padding:12px;">DynamoDB Stream</td>
        <td style="border:1px solid #e5e7eb;padding:12px;">Phát event khi có item mới</td>
      </tr>
      <tr>
        <td style="border:1px solid #e5e7eb;padding:12px;">AWS Lambda #2</td>
        <td style="border:1px solid #e5e7eb;padding:12px;">Đọc DynamoDB Stream và gửi notification</td>
      </tr>
      <tr>
        <td style="border:1px solid #e5e7eb;padding:12px;">Amazon SNS</td>
        <td style="border:1px solid #e5e7eb;padding:12px;">Gửi email thông báo</td>
      </tr>
    </tbody>
  </table>

  <h2>4. Vì sao dùng SQS giữa S3 và Lambda?</h2>

  <p>
    Một thiết kế đơn giản hơn có thể là S3 gọi trực tiếp Lambda.
    Tuy nhiên, trong môi trường production, cách này không tối ưu nếu lượng upload tăng đột biến hoặc Lambda gặp lỗi tạm thời.
  </p>

  <div style="background:#ecfdf5;border-left:5px solid #10b981;padding:16px;border-radius:8px;margin:20px 0;">
    <strong>Thiết kế tốt hơn:</strong>
    <p style="margin:8px 0 0;">S3 → SQS → Lambda</p>
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

  <pre style="background:#0f172a;color:#e5e7eb;padding:16px;border-radius:12px;overflow:auto;"><code>Bucket name: image-upload-source-bucket-kien
Region: ap-southeast-2
Event type: ObjectCreated:Put</code></pre>

  <p>
    Bucket này sẽ phát sinh event mỗi khi có object mới được upload.
  </p>

  <h2>6. Tạo SQS Queue</h2>

  <p>Tạo một SQS Standard Queue:</p>

  <pre style="background:#0f172a;color:#e5e7eb;padding:16px;border-radius:12px;overflow:auto;"><code>Queue name: image-upload-queue
Queue type: Standard</code></pre>

  <p>
    Không dùng FIFO Queue cho bài lab này vì S3 Event Notification phù hợp nhất với Standard Queue trong mô hình đơn giản.
  </p>

  <h3>SQS Access Policy</h3>

  <p>
    Để S3 có thể gửi message vào SQS, queue cần có policy cho phép service <code>s3.amazonaws.com</code> gọi <code>sqs:SendMessage</code>.
  </p>

  <pre style="background:#0f172a;color:#e5e7eb;padding:16px;border-radius:12px;overflow:auto;"><code>{
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

  <pre style="background:#0f172a;color:#e5e7eb;padding:16px;border-radius:12px;overflow:auto;"><code>Event name: image-upload-event
Event type: PUT
Destination: SQS Queue
Queue: image-upload-queue</code></pre>

  <p>
    Từ giờ, mỗi khi upload ảnh lên S3, một message sẽ được gửi vào SQS.
  </p>

  <h2>8. Tạo DynamoDB Table</h2>

  <p>Tạo bảng DynamoDB để lưu metadata ảnh.</p>

  <pre style="background:#0f172a;color:#e5e7eb;padding:16px;border-radius:12px;overflow:auto;"><code>Table name: ImageMetadataTable
Partition key: image_id
Type: String</code></pre>

  <p>Một item mẫu sau khi upload ảnh:</p>

  <pre style="background:#0f172a;color:#e5e7eb;padding:16px;border-radius:12px;overflow:auto;"><code>{
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

  <pre style="background:#0f172a;color:#e5e7eb;padding:16px;border-radius:12px;overflow:auto;"><code>Stream status: Enabled
View type: NEW_AND_OLD_IMAGES</code></pre>

  <p>
    Trong bài này, Lambda #2 sẽ chỉ xử lý event có loại <code>INSERT</code>.
  </p>

  <h2>10. Tạo Lambda #1: ProcessImageMetadataFunction</h2>

  <p>Lambda đầu tiên có nhiệm vụ đọc message từ SQS và ghi metadata vào DynamoDB.</p>

  <pre style="background:#0f172a;color:#e5e7eb;padding:16px;border-radius:12px;overflow:auto;"><code>Function name: ProcessImageMetadataFunction
Runtime: Python 3.13
Trigger: Amazon SQS
Environment variable:
TABLE_NAME=ImageMetadataTable</code></pre>

  <h3>Code Lambda #1</h3>

  <pre style="background:#0f172a;color:#e5e7eb;padding:16px;border-radius:12px;overflow:auto;"><code>import json
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

  <pre style="background:#0f172a;color:#e5e7eb;padding:16px;border-radius:12px;overflow:auto;"><code>AWSLambdaBasicExecutionRole
AmazonSQSFullAccess
AmazonDynamoDBFullAccess</code></pre>

  <h2>11. Tạo SNS Topic</h2>

  <p>Tạo SNS Topic để gửi email thông báo.</p>

  <pre style="background:#0f172a;color:#e5e7eb;padding:16px;border-radius:12px;overflow:auto;"><code>Topic name: image-upload-notification-topic
Type: Standard</code></pre>

  <div style="background:#fff7ed;border-left:5px solid #f97316;padding:16px;border-radius:8px;margin:20px 0;">
    <strong>Lưu ý:</strong>
    <p style="margin:8px 0 0;">
      Không tạo SNS FIFO Topic. FIFO Topic không hỗ trợ Email Subscription trong trường hợp này.
    </p>
  </div>

  <h3>Tạo Email Subscription</h3>

  <pre style="background:#0f172a;color:#e5e7eb;padding:16px;border-radius:12px;overflow:auto;"><code>Protocol: Email
Endpoint: your-email@gmail.com
Status: Confirmed</code></pre>

  <p>
    Sau khi tạo subscription, AWS sẽ gửi email xác nhận. Bạn cần mở Gmail và bấm Confirm subscription.
  </p>

  <h2>12. Tạo Lambda #2: NotifyImageUploadFunction</h2>

  <p>
    Lambda thứ hai nhận event từ DynamoDB Stream và gửi email thông báo qua SNS.
  </p>

  <pre style="background:#0f172a;color:#e5e7eb;padding:16px;border-radius:12px;overflow:auto;"><code>Function name: NotifyImageUploadFunction
Runtime: Python 3.13
Trigger: DynamoDB Stream
Environment variable:
SNS_TOPIC_ARN=arn:aws:sns:ap-southeast-2:606030503959:image-upload-notification-topic</code></pre>

  <h3>Code Lambda #2</h3>

  <pre style="background:#0f172a;color:#e5e7eb;padding:16px;border-radius:12px;overflow:auto;"><code>import json
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

  <pre style="background:#0f172a;color:#e5e7eb;padding:16px;border-radius:12px;overflow:auto;"><code>AWSLambdaBasicExecutionRole
AmazonSNSFullAccess
AWSLambdaDynamoDBExecutionRole</code></pre>

  <h2>13. Gắn DynamoDB Stream Trigger cho Lambda #2</h2>

  <p>Trong DynamoDB Table, tạo trigger:</p>

  <pre style="background:#0f172a;color:#e5e7eb;padding:16px;border-radius:12px;overflow:auto;"><code>Source: ImageMetadataTable Stream
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

  <pre style="background:#0f172a;color:#e5e7eb;padding:16px;border-radius:12px;overflow:auto;"><code>Messages Available: 0
Messages In Flight: 1</code></pre>

  <h3>Kiểm tra DynamoDB</h3>

  <p>
    Trong bảng ImageMetadataTable, item mới sẽ xuất hiện.
  </p>

  <pre style="background:#0f172a;color:#e5e7eb;padding:16px;border-radius:12px;overflow:auto;"><code>image_id: image-upload-source-bucket-kien/anh.jpg
bucket_name: image-upload-source-bucket-kien
object_key: anh.jpg
object_size: 271646
status: UPLOADED</code></pre>

  <h3>Kiểm tra email</h3>

  <p>Email nhận được sẽ có nội dung:</p>

  <pre style="background:#0f172a;color:#e5e7eb;padding:16px;border-radius:12px;overflow:auto;"><code>Subject: New Image Uploaded

A new image has been uploaded.

Image ID: image-upload-source-bucket-kien/anh.jpg
Bucket: image-upload-source-bucket-kien
Object Key: anh.jpg
Size: 271646 bytes
Status: UPLOADED
Created At: 2026-05-31T18:03:10.902576+00:00</code></pre>

  <h2>15. Các lỗi thường gặp</h2>

  <h3>Lỗi 1: S3 không gửi được event vào SQS</h3>

  <pre style="background:#0f172a;color:#e5e7eb;padding:16px;border-radius:12px;overflow:auto;"><code>Unable to validate the following destination configurations</code></pre>

  <p>Nguyên nhân là SQS chưa cấp quyền cho S3 gửi message.</p>

  <p>Cách sửa: thêm SQS Access Policy cho <code>s3.amazonaws.com</code>.</p>

  <h3>Lỗi 2: Lambda #1 không ghi được DynamoDB</h3>

  <pre style="background:#0f172a;color:#e5e7eb;padding:16px;border-radius:12px;overflow:auto;"><code>AccessDeniedException when calling the PutItem operation</code></pre>

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

  <pre style="background:#0f172a;color:#e5e7eb;padding:16px;border-radius:12px;overflow:auto;"><code>Confirmed</code></pre>

  <p>
    Nếu là Pending confirmation, hãy mở email và bấm xác nhận.
  </p>

  <h2>16. Kết quả cuối cùng</h2>

  <p>Sau khi hoàn thành, hệ thống hoạt động theo luồng:</p>

  <div style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:16px;padding:24px;margin:24px 0;">
    <div style="display:flex;flex-direction:column;align-items:center;gap:10px;font-size:17px;font-weight:600;">
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

    <p class="footer-note">HTML article generated from provided content.</p>
  </main>
</body>
</html>','https://media.cloudmentor.pro/assets/use-an-s3-bucket-event-to-trigger-sqs-queue-to-insert-image-info-into-dynamodb-table-202403/ad8de2c4-adb6-41a5-a33d-47f7cf2f0ced.png','2026-05-31 18:19:03.670'),(6,'Blog - CI/CD AWS SAM với GitHub Actions','Blog này tổng hợp cách triển khai ứng dụng AWS SAM với Lambda, API Gateway, DynamoDB, S3 Artifact Bucket và CloudFormation thông qua GitHub Actions.','<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Blog - CI/CD AWS SAM với GitHub Actions</title>
  <style>
    * { box-sizing: border-box; }

    body {
      margin: 0;
      font-family: Arial, sans-serif;
      line-height: 1.6;
      background: #f4f6f8;
      color: #222;
    }

    .container {
      max-width: 900px;
      margin: auto;
      background: #fff;
      padding: 30px 24px;
      min-height: 100vh;
    }

    .hero {
      text-align: center;
      margin-bottom: 30px;
    }

    .hero img {
      width: 100%;
      max-height: 300px;
      object-fit: cover;
      border-radius: 12px;
      margin-bottom: 18px;
    }

    h1 {
      margin-bottom: 8px;
      font-size: 32px;
      color: #111827;
    }

    h2 {
      margin-top: 30px;
      color: #1f2937;
      border-left: 5px solid #f59e0b;
      padding-left: 12px;
    }

    h3 {
      margin-top: 22px;
      color: #374151;
    }

    p { margin: 10px 0; }

    ul, ol { padding-left: 24px; }

    li { margin-bottom: 8px; }

    .tag {
      display: inline-block;
      background: #fff7ed;
      color: #c2410c;
      padding: 6px 12px;
      border-radius: 999px;
      font-size: 14px;
      margin: 4px;
    }

    .flow {
      background: #111827;
      color: #f9fafb;
      padding: 18px;
      border-radius: 10px;
      overflow-x: auto;
      font-family: Consolas, monospace;
      font-size: 15px;
      margin-top: 12px;
    }

    code {
      background: #f3f4f6;
      color: #111827;
      padding: 2px 6px;
      border-radius: 5px;
      font-family: Consolas, monospace;
    }

    pre {
      background: #111827;
      color: #f9fafb;
      padding: 16px;
      border-radius: 10px;
      overflow-x: auto;
      line-height: 1.5;
    }

    pre code {
      background: transparent;
      color: inherit;
      padding: 0;
      border-radius: 0;
    }

    .note {
      background: #ecfdf5;
      border-left: 5px solid #10b981;
      padding: 14px;
      border-radius: 8px;
      margin-top: 16px;
    }


    .repo-box {
      background: #f8fafc;
      border: 1px solid #e5e7eb;
      border-radius: 10px;
      padding: 16px;
      margin-top: 16px;
    }

    .repo-button {
      display: inline-block;
      margin-top: 10px;
      background: #111827;
      color: #ffffff;
      text-decoration: none;
      padding: 10px 16px;
      border-radius: 8px;
      font-weight: bold;
    }

    .repo-button:hover {
      background: #374151;
    }

    .warning {
      background: #fff7ed;
      border-left: 5px solid #f97316;
      padding: 14px;
      border-radius: 8px;
      margin-top: 16px;
    }

    footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
      color: #6b7280;
      font-size: 14px;
    }

    @media (max-width: 600px) {
      .container { padding: 22px 16px; }
      h1 { font-size: 26px; }
    }
  </style>
</head>
<body>
  <main class="container">
    <section class="hero">
      <img src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80" alt="Cloud computing architecture">
      <h1>Triển khai CI/CD AWS SAM bằng GitHub Actions</h1>
      <p>
        Bài viết này hướng dẫn cách tạo pipeline tự động để build và deploy ứng dụng
        serverless gồm Lambda, API Gateway và DynamoDB lên AWS.
      </p>
      <div>
        <span class="tag">AWS SAM</span>
        <span class="tag">GitHub Actions</span>
        <span class="tag">Lambda</span>
        <span class="tag">API Gateway</span>
        <span class="tag">DynamoDB</span>
      </div>

      <div class="repo-box">
        <strong>Source code dự án:</strong>
        <p>Repository GitHub chứa code mẫu AWS SAM, Lambda, template và workflow CI/CD.</p>
        <a class="repo-button" href="https://github.com/Kien-devops/SAM" target="_blank" rel="noopener noreferrer">
          Xem repository trên GitHub
        </a>
      </div>
    </section>

    <section>
      <h2>1. Mục tiêu bài lab</h2>
      <p>Sau khi làm xong, hệ thống sẽ chạy theo luồng:</p>
      <div class="flow">
Developer → GitHub Repository → GitHub Actions<br>
→ sam build → Upload artifact lên S3<br>
→ sam deploy → CloudFormation<br>
→ API Gateway → Lambda → DynamoDB
      </div>
      <ul>
        <li>Push code lên GitHub.</li>
        <li>GitHub Actions tự động chạy pipeline.</li>
        <li>SAM build code Lambda.</li>
        <li>SAM deploy hạ tầng lên AWS.</li>
        <li>Người dùng gọi API <code>/hello</code> để kiểm tra kết quả.</li>
      </ul>
    </section>

    <section>
      <h2>2. Các thành phần chính</h2>

      <h3>GitHub Actions</h3>
      <p>
        Là nơi chạy pipeline CI/CD. Khi bạn push code lên nhánh <code>main</code>,
        workflow sẽ tự động được kích hoạt.
      </p>

      <h3>AWS SAM</h3>
      <p>
        Dùng để build và deploy ứng dụng serverless. SAM đọc file <code>template.yaml</code>
        rồi triển khai Lambda, API Gateway và DynamoDB thông qua CloudFormation.
      </p>

      <h3>S3 Bucket</h3>
      <p>
        Dùng để lưu file zip chứa source code Lambda sau khi build.
      </p>

      <h3>CloudFormation</h3>
      <p>
        Nhận template từ SAM và tạo hoặc cập nhật tài nguyên trên AWS.
      </p>

      <h3>Lambda, API Gateway, DynamoDB</h3>
      <p>
        API Gateway nhận request từ người dùng, chuyển vào Lambda.
        Lambda xử lý logic và có thể làm việc với DynamoDB.
      </p>
    </section>

    <section>
      <h2>3. Chuẩn bị</h2>
      <ol>
        <li>Tài khoản AWS.</li>
        <li>Repository GitHub chứa source code SAM: <a href="https://github.com/Kien-devops/SAM" target="_blank" rel="noopener noreferrer">Kien-devops/SAM</a>.</li>
        <li>Một S3 Bucket để lưu artifact.</li>
        <li>IAM User hoặc IAM Role có quyền deploy AWS.</li>
        <li>GitHub Secrets để lưu thông tin AWS.</li>
      </ol>

      <div class="warning">
        <strong>Lưu ý:</strong> Không ghi Access Key trực tiếp vào code.
        Hãy lưu trong GitHub Secrets.
      </div>
    </section>

    <section>
      <h2>4. Cấu hình GitHub Secrets</h2>
      <p>Vào repository GitHub:</p>
      <pre>Settings → Secrets and variables → Actions → New repository secret</pre>

      <p>Thêm các secret sau:</p>
      <ul>
        <li><code>AWS_ACCESS_KEY_ID</code>: Access Key ID của AWS.</li>
        <li><code>AWS_SECRET_ACCESS_KEY</code>: Secret Access Key của AWS.</li>
        <li><code>S3_BUCKET</code>: Tên S3 Bucket dùng để chứa artifact.</li>
      </ul>
    </section>

    <section>
      <h2>5. File GitHub Actions deploy.yml</h2>
      <p>Tạo file tại đường dẫn:</p>
      <pre>.github/workflows/deploy.yml</pre>

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
    </section>

    <section>
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
    </section>

    <section>
      <h2>7. Cách chạy pipeline</h2>
      <p>Commit và push code lên GitHub:</p>
      <pre><code>git add .
git commit -m "setup aws sam cicd"
git push origin main</code></pre>

      <p>
        Sau khi push, vào tab <strong>Actions</strong> trên GitHub để xem pipeline đang chạy.
        Nếu chạy thành công, ứng dụng sẽ được deploy lên AWS.
      </p>
    </section>

    <section>
      <h2>8. Test API sau khi deploy</h2>
      <p>
        Vào AWS CloudFormation, chọn stack, mở tab <strong>Outputs</strong>,
        copy URL của API Gateway.
      </p>

      <p>Test bằng lệnh:</p>
      <pre><code>curl https://&lt;api-id&gt;.execute-api.ap-southeast-2.amazonaws.com/hello</code></pre>

      <p>Kết quả mong đợi:</p>
      <pre><code>{
  "message": "kết nối thành công sam",
  "method": "GET",
  "path": "/hello",
  "tableName": "sam-cicd-users"
}</code></pre>
    </section>

    <section>
      <h2>9. Lỗi thường gặp</h2>
      <ul>
        <li><strong>Pipeline không chạy:</strong> Kiểm tra file có đúng đường dẫn <code>.github/workflows/deploy.yml</code> không.</li>
        <li><strong>Lỗi AWS Credentials:</strong> Kiểm tra lại GitHub Secrets.</li>
        <li><strong>Lỗi quyền IAM:</strong> Kiểm tra IAM có quyền với S3, CloudFormation, Lambda, API Gateway và DynamoDB không.</li>
        <li><strong>Lỗi S3 Bucket:</strong> Kiểm tra tên bucket trong secret <code>S3_BUCKET</code>.</li>
        <li><strong>API lỗi:</strong> Kiểm tra CloudWatch Logs của Lambda.</li>
      </ul>
    </section>

    <section>
      <h2>10. Dọn dẹp tài nguyên</h2>
      <ol>
        <li>Xóa stack trong CloudFormation.</li>
        <li>Xóa DynamoDB Table nếu table còn được giữ lại.</li>
        <li>Làm trống và xóa S3 Bucket nếu không dùng nữa.</li>
      </ol>

      <div class="note">
        <strong>Kết luận:</strong> Chỉ cần push code lên GitHub, GitHub Actions sẽ tự động build và deploy ứng dụng serverless lên AWS bằng SAM.
      </div>
    </section>

    <footer>
      Blog thực hành CI/CD AWS SAM - Một page đơn giản, đủ nội dung để làm theo.
    </footer>
  </main>
</body>
</html>','https://media.cloudmentor.pro/assets/create-build-and-deploy-a-sample-hello-world-app-using-aws-sam-202403/a07fd96d-8a4b-419a-bcee-2bb167bc2715.png','2026-06-02 03:00:25.510');
INSERT INTO [dbo].[project_details] ([id],[project_id],[icon],[detail_title],[detail_description]) VALUES (1,1,'fa-solid fa-route','Traffic Routing','Internet requests navigate through an external HAProxy Edge Load Balancer, forwarding into a Kubernetes Traefik Gateway API, exposing isolated Frontend and Backend service endpoints.'),(2,1,'fa-solid fa-server','Application Stack','Front-facing UI crafted in React 19 + Vite. Microservice backends run ASP.NET Core 9 API connecting securely to a Microsoft SQL Server database.'),(3,1,'fa-solid fa-shield','IaC & Bootstrapping','Terraform provisions AWS EC2 instances dynamically. Custom Ansible Playbooks configure dependencies, kernel parameters, and boot them into a private Kubernetes cluster.'),(4,1,'fa-solid fa-gears','Metric-driven Autoscaling','Prometheus watches system load. On threshold breaches, Alertmanager sends webhook alerts to a Python scaling daemon, which dynamically provisions and joins new worker nodes via Terraform & Ansible.'),(5,2,'fa-solid fa-shield-halved','DevSecOps Pipeline','Multi-stage GitHub Actions workflows enforce SonarQube quality gates, audit dependencies using Nexus, scan container layers via Trivy, and push to Amazon ECR.'),(6,2,'fa-brands fa-aws','EKS Infrastructure','Configured using modular Terraform modules. Implements IAM Roles for Service Accounts (IRSA/OIDC) for fine-grained pod access control and KMS-encrypted secrets.'),(7,2,'fa-solid fa-lock','Cluster Security Policies','Active runtime security audits using Falco. Custom Kyverno policies enforce non-root container constraints and block privilege escalation paths.'),(8,2,'fa-solid fa-chart-line','Centralized Observability','Real-time cluster state dashboarding. Centralized log shipping via Promtail into Loki, queried within Grafana, paired with custom Alertmanager triggers.'),(9,3,'fa-solid fa-server','Application Stack','Front-facing UI crafted in React 19 + Vite. Microservice backends run ASP.NET Core 9 API connecting securely to a Microsoft SQL Server database, integrated with a node-local standalone Redis DaemonSet for caching.'),(10,3,'fa-solid fa-shield-halved','DevSecOps Pipeline','Multi-stage GitHub Actions workflows restore dependencies through cached NuGet/npm groups in a local Nexus Repository, enforce SonarQube quality gates, perform Trivy filesystem scans, and archive build artifacts.'),(11,3,'fa-solid fa-shield','Supply Chain Security','A remote build host connected via a secure Tailscale VPN SSH link downloads the ZIP artifacts from Nexus, builds non-root alpine-based Docker images, performs Trivy image security scans (failing on HIGH or CRITICAL alerts), and pushes them to a local Nexus Docker Registry.'),(12,3,'fa-solid fa-route','GitOps Continuous Delivery','The workflow dynamically updates manifest image tags in Git. Argo CD monitors the Git repository as the single source of truth and automates declarative zero-drift sync to the self-hosted Kubernetes cluster.'),(13,3,'fa-solid fa-lock','Cluster Hardening & Security Policies','Enforces Kyverno policy baselines at the admission stage, tracks cluster-wide vulnerabilities via Trivy Operator reports, and implements Falco for real-time runtime security anomaly detection.'),(14,3,'fa-solid fa-chart-line','Observability & Logging','Centralized log collection is handled via Promtail shipping logs to Loki, while cluster-wide metrics are gathered by Prometheus Operator, and Alertmanager handles alert notifications, all queried and visualized on custom Grafana dashboards.');
INSERT INTO [dbo].[projects] ([id],[project_number],[title],[summary],[github_url],[tech_stack]) VALUES (1,'PROJECT 01','Hospital Platform CI/CD, GitOps, Kubernetes & Auto Scaling','A full-stack hospital management platform deployed through an automated DevOps pipeline featuring dynamic metric-driven infrastructure scaling.','https://github.com/Kien-devops/cicd-ecr-kube-ec2-gitaction.git','AWS EC2, Kubernetes, HAProxy, Traefik API, Terraform, Ansible, Argo CD, Prometheus'),(2,'PROJECT 02','Hospital EKS DevSecOps GitOps Platform','An end-to-end cloud platform demonstrating EKS cluster hardening, multi-gate security scanning, and declarative zero-drift deployments.','https://github.com/Kien-devops/eks-cicd-argocd-sec-monitor.git','AWS EKS, Argo CD, SonarQube, Trivy, Kyverno, Falco, Loki / Promtail, Terraform'),(3,'PROJECT 03','Hospital On-Premise DevSecOps GitOps Platform','An end-to-end self-hosted on-premise Kubernetes platform demonstrating multi-layer security scanning, dependency caching, GitOps continuous delivery, and full-stack observability.','https://github.com/Kien-devops/k8s-home.git','Kubernetes (On-Premise), Argo CD, Nexus Repository, SonarQube, Trivy, Tailscale, Kyverno, Falco, Loki / Promtail, HAProxy / Traefik');
