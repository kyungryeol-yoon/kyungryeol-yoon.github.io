---
title: "[Spring] Spring Security, JWT, 인증, 인가"
date: 2022-06-05
categories: [Spring, Security]
tags: [Spring, Security, JWT]
---

## **Spring Security, JWT, 인증, 인가**

- Spring Security를 베이스로 JWT를 사용해서 해당 프로젝트의 인증과 인가를 구현한다.
- 이와 관련돼서 생성된 Class는 다음과 같다.
  - SecurityConfig : Spring Security관련 설정
  - UserAccount : Spring Security에서 인증 요소(principal)로 사용되는 객체. Userdetails를 상속받고 Account의 정보를 갖는다.
  - PrincipalDetailService : 인증 시, DB에서 Account를 찾고 UserAccount로 반환하는 loadUserByUsername Method를 갖는다.
  - JwtAutienticationFilter : jwt를 사용해서 인증 처리
  - JwtAutiorizationFilter : jwt를 사용해서 인가 처리

### **SecurityConfig**

- Spring Security가 사용할 정책, 필터, 인가 권한 등을 설정한다.

```java
@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig extends WebSecurityConfigurerAdapter {

  private final AccountRepository accountRepository;
  private final JwtProcessor jwtProcessor;

  @Override
  protected void configure(HttpSecurity http) throws Exception {
    http
          .csrf().disable()
          .formLogin().disable()
          .httpBasic().disable();

    http
          .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS);

    http
          .addFilter(corsFilter())
          .addFilter(new JwtAuthenticationFilter(authenticationManager(), jwtProcessor))
          .addFilter(new JwtAuthorizationFilter(authenticationManager(), accountRepository, jwtProcessor));

    http
          .authorizeRequests()
          .mvcMatchers("/home", "/login").permitAll() //** 홈페이지, login
          .anyRequest().hasAuthority("ROLE_USER");
  }

  @Override
  public void configure(WebSecurity web) throws Exception {
    web
          .ignoring()
          .requestMatchers(PathRequest.toStaticResources().atCommonLocations());
  }

  @Bean
  public CorsFilter corsFilter() {
    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    CorsConfiguration config = new CorsConfiguration();
    config.setAllowCredentials(true);
    config.addAllowedOriginPattern("*");
    config.addAllowedHeader("*");
    config.addAllowedMethod("*");
    source.registerCorsConfiguration("/**", config);
    return new CorsFilter(source);
  }

  @Bean
  @Override
  public AuthenticationManager authenticationManagerBean() throws Exception {
    return super.authenticationManagerBean();
  }
```

#### **기본 설정**

```java
http
      .csrf().disable()
      .formLogin().disable()
      .httpBasic().disable();

http
      .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS);
```

- **csrf.disable()** : API를 작성하는데 프런트가 정해져있지 않기 때문에 csrf설정은 우선 꺼놓는다.
- **formLogin.disable()** : formLogin 대신 Jwt를 사용하기 때문에 disable로 설정 
- **httpBasic.disable()** : httpBasic 방식 대신 Jwt를 사용하기 때문에 disable로 설정
- **SessionCreationPolicy.STATELESS** : Jwt를 사용하기 때문에 session을 stateless로 설정한다. stateless로 설정 시 Spring Security는 세션을 사용하지 않는다.

#### **추가 필터**

```java
http
      .addFilter(corsFilter())
      .addFilter(new JwtAuthenticationFilter(authenticationManager(), jwtProcessor))
      .addFilter(new JwtAuthorizationFilter(authenticationManager(), accountRepository, jwtProcessor));
```

#### **corsFilter**

```java
@Bean
public CorsFilter corsFilter() {
  UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
  CorsConfiguration config = new CorsConfiguration();
  config.setAllowCredentials(true);
  config.addAllowedOriginPattern("*");
  config.addAllowedHeader("*");
  config.addAllowedMethod("*");
  source.registerCorsConfiguration("/**", config);
  return new CorsFilter(source);
}
```

- cors관련 설정을 포함한 필터.
- 기본적으로 서버 또는 지정된 특정 도메인의 요청만 허용하지만 프런트가 정해져있지 않기 때문에 모든 도메인을 허용하는 방식으로 설정.
  - **setAllowCredentials** : 내 서버가 응답을 할 때 json을 자바스크립트에서 처리할수 있게 할지를 설정
  - **addAllowedOriginPattern** : 허용할 도메인 목록
  - **addAllowedHeader** : 허용할 헤더 목록
  - **addAllowedMethod** : 허용할 Method(GET, PUT, 등) 목록
  - **source.registerCorsConfiguration** : 지정한 url에 config 적용

#### **JwtAuthenticationFilter**

- Jwt를 사용한 인증을 구현한 필터

#### **JwtAuthorizationFilter**

- Jwt를 사용한 인가를 구현한 필터

#### **인가**

```java
http
          .authorizeRequests()
          .mvcMatchers("/home", "/login").permitAll() //** 홈페이지, 로그인
          .anyRequest().hasAuthority("ROLE_USER");
```

- **authorizationRequest** : 요청에 따른 인가 설정
  - 기본적으로 모든 uri은 ROLE_USER의 권한만 허용
  - 홈페이지와 로그인, 스웨거 관련 uri은 모두 허용
  - **configure(WebSecurity web)** : HttpSecurity에서 설정하지 않은 정적리소스와 HTML 등에 관한 권한을 설정한다.
    - **web.ignoring().requestMathers(PathRequest.toStaticResources().atCommonLocations())**
      - static 리소스의 자원을 Security에서 제외(Security에서 걸러지지 않고 접근 가능)

#### **authenticationManagerBean**

```java
@Override
public void configure(WebSecurity web) throws Exception {
  web
        .ignoring()
        .requestMatchers(PathRequest.toStaticResources().atCommonLocations());
}
```

- WebSecurityConfigurerAdepter를 상속받은 SecurityConfigure 외에서 AuthenticationManager를 사용하려면 authenticationManagerBean()을 오버라이드 해서 @Bean으로 직접 등록해야 한다.

## **UserDetails, UserDetailsService**

- Spring Security에서 인증, 인가를 할 때 사용되는 Principal과 관련 서비스 Class를 만든다.

### **UserAccount**

- Principal은 인증, 인가시 검증되는 객체이기 때문에 본 프로젝트에서 사용되는 회원의 정보인 Account를 갖고 있어야 한다.

```java
@Getter
public class UserAccount implements UserDetails {

  private Account account;

  public UserAccount(Account account) {
    this.account = account;
  }

  @Override
  public Collection<? extends GrantedAuthority> getAuthorities() {
    Collection<GrantedAuthority> authorities = new ArrayList<>();
    String roleName = account.getRole().getRoleName();
    authorities.add(() -> roleName);
    return authorities;
  }

  @Override
  public String getPassword() {
    return account.getPassword();
  }

  @Override
  public String getUsername() {
    return account.getUsername();
  }

  @Override
  public boolean isAccountNonExpired() {
    return true;
  }

  @Override
  public boolean isAccountNonLocked() {
    return true;
  }

  @Override
  public boolean isCredentialsNonExpired() {
    return true;
  }

  @Override
  public boolean isEnabled() {
    return true;
  }
}
```

- UserDetails를 상속받는다.
- 회원 계정 엔티티인 Account를 필드로 갖는다.
- **getAuthorities()** : account의 Role에 저장된 권한 정보를 authorities에 담고 반환한다.
- **isAccountNonExpired()** : 계정이 만료되지 않았는지를 리턴(true => 만료되지 않음을 의미)
- **isAccountNonLocked()** : 계정이 잠겨있는지를 리턴(true => 잠겨있지 않음을 의미)
- **isCredentialNonExpired()** : 계정의 패스워드가 만료되어있는지 를 리턴(true => 만료되지 않음을 의미)
- **isEnabled()** : 계정이 사용 가능한지를 리턴

### **PrincipalDetailService**

```java
@Service
@RequiredArgsConstructor
public class PrincipalDetailService implements UserDetailsService {

  private final AccountRepository accountRepository;

  @Override
  public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
    Account account = accountRepository.findByUsername(username)
          .orElseThrow(() -> new NonExistResourceException("해당 username을 갖는 Account를 찾을 수 없습니다."));
    return new UserAccount(account);
  }
}
```

- UserDetailsService를 상속받는다.

#### **loadUserByUsername(String username)**

```java
@Override
public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
  Account account = accountRepository.findByUsername(username)
        .orElseThrow(() -> new NonExistResourceException("해당 username을 갖는 Account를 찾을 수 없습니다."));
  return new UserAccount(account);
}
```

- Spring Security에서 AutenticationManager가 authenticate()를 통해서 인증을 할 때, 지정된 repository에서 인증 대상 객체를 찾아서  Principal 형태로 반환

#### **AccountRepository**

```java
public interface AccountRepository extends JpaRepository<Account, Long> {

  Optional<Account> findByUsername(String username);
}
```

- Spring 데이터 JPA를 사용해서 Repository를 생성한다.
- findByUsername : username(= id)으로 Account를 찾아서 반환한다.

## **Jwt**

- Jwt를 생성하고 디코딩하는 클래스와 Jwt를 사용한 인증, 인가 필터를 구현한 클래스를 만든다.

### **JwtProcessor**

```java
@Component
public class JwtProcessor {

  public String createAuthJwtToken(UserAccount userAccount) {
    return JWT.create()
          .withSubject(userAccount.getUsername())
          .withExpiresAt(new Date(System.currentTimeMillis() + JwtProperties.EXPIRATION_TIME))
          .withClaim("id", userAccount.getAccount().getId())
          .withClaim("username", userAccount.getAccount().getUsername())
          .sign(Algorithm.HMAC512(JwtProperties.SECRET));
  }

  public String decodeJwtToken(String jwtToken, String secretKey, String claim) {
    return JWT.require(Algorithm.HMAC512(secretKey)).build()
          .verify(jwtToken)
          .getClaim(claim)
          .asString();
  }

  public String extractBearer(String jwtHeader) {
    int pos = jwtHeader.lastIndexOf(" ");
    return jwtHeader.substring(pos + 1);
  }
}
```

#### **creatAuthJwtToken**

```java
public String createAuthJwtToken(UserAccount userAccount) {
  return JWT.create()
        .withSubject(userAccount.getUsername())
        .withExpiresAt(new Date(System.currentTimeMillis() + JwtProperties.EXPIRATION_TIME))
        .withClaim("id", userAccount.getAccount().getId())
        .withClaim("username", userAccount.getAccount().getUsername())
        .sign(Algorithm.HMAC512(JwtProperties.SECRET));
}
```

- userAccount를 받아서 JwtToken을 생성하고 반환.
- Account의 id(엔티티의 id)와 username(로그인 시 id로 사용됨)을  HMAC512 알고리즘으로 암호화한다.
- 만료시간은 현재 시간으로부터 JwtProperties(Jwt관련 설정 정보를 모아놓은 클래스)에 정의된 EXPIRATION_TIME까지로 설정

> 만료시간은 밀리 세컨드로 설정됨
{: .prompt-info }

#### **decodeJwtToken**

```java
public String decodeJwtToken(String jwtToken, String secretKey, String claim) {
  return JWT.require(Algorithm.HMAC512(secretKey)).build()
        .verify(jwtToken)
        .getClaim(claim)
        .asString();
}
```

- JwtToken을 받으면 secretKey를 사용해서 지정된 claim을 반환한다

#### **extractBearer**

```java
public String extractBearer(String jwtHeader) {
  int pos = jwtHeader.lastIndexOf(" ");
  return jwtHeader.substring(pos + 1);
}
```

- Authentication 해더의 Jwt Token은 앞에 "Bearer "가 붙기 때문에 "Bearer "를 제거하고 뒤의 순수한 Jwt Token만을 추출한다.

#### **JwtProperties**

```java
public interface JwtProperties {
  String SECRET = (JWT 암호화시 사용할 SecretKey);
  int EXPIRATION_TIME = 60000 * 60;
  String TOKEN_PREFIX = "Bearer";
  String HEADER_STRING = "Authorization";
}
```

- JWT와 관련된 설정 수치들을 지정한 인터페이스
- JWT 암호화 시 사용되는 SecretKey의 값이 있기 때문에 gitIgnore 설정

#### **JwtAuthenticationFilter**

```java
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends UsernamePasswordAuthenticationFilter {
  private final AuthenticationManager authenticationManager;
  private final JwtProcessor jwtProcessor;

  @SneakyThrows
  @Override
  public Authentication attemptAuthentication(HttpServletRequest request, HttpServletResponse response)
        throws AuthenticationException {
    ObjectMapper objectMapper = new ObjectMapper();
    Account account = objectMapper.readValue(request.getInputStream(), Account.class);

    UsernamePasswordAuthenticationToken authenticationToken =
          new UsernamePasswordAuthenticationToken(account.getUsername(), account.getPassword());

    Authentication authentication = authenticationManager.authenticate(authenticationToken);
    return authentication;
  }

  @Override
  protected void successfulAuthentication(HttpServletRequest request, HttpServletResponse response, FilterChain chain,
                                          Authentication authResult) throws IOException, ServletException {
    UserAccount userAccount = (UserAccount) authResult.getPrincipal();

    String jwtToken = jwtProcessor.createAuthJwtToken(userAccount);

    response.addHeader(JwtProperties.HEADER_STRING, JwtProperties.TOKEN_PREFIX + " " + jwtToken);
  }
}
```

- JWT로 인증을 하기 위한 클래스
- Spring Security 로그인 시 인증을 담당하는 UsernamePasswordAuthenticationFilter를 상속받는다.

> Spring Bean으로 등록하지 않는 이유는 해당 클래스가 AuthenticationManager를 의존성 주입받는데 해당 클래스를 사용하는 SecurityConfig에서 AuthenticationManager를 빈으로 등록하기 때문에 순환 참조가 발생하기 때문이다.
{: .prompt-info }

#### **attemptAuthentication**

```java
@SneakyThrows
@Override
public Authentication attemptAuthentication(HttpServletRequest request, HttpServletResponse response)
      throws AuthenticationException {
  ObjectMapper objectMapper = new ObjectMapper();
  Account account = objectMapper.readValue(request.getInputStream(), Account.class);

  UsernamePasswordAuthenticationToken authenticationToken =
        new UsernamePasswordAuthenticationToken(account.getUsername(), account.getPassword());

  Authentication authentication = authenticationManager.authenticate(authenticationToken);
  return authentication;
}
```

- 로그인 시 인증을 위해 실행되는 Method
- 오버라이드 해서 Json으로 들어오는 id와 password로 인증을 하도록 변경한다.
- 반환 값은 인증된 Authentication 객체이다.

#### **successfulAuthentication**

```java
@Override
protected void successfulAuthentication(HttpServletRequest request, HttpServletResponse response, FilterChain chain,
                                      Authentication authResult) throws IOException, ServletException {
  UserAccount userAccount = (UserAccount) authResult.getPrincipal();

  String jwtToken = jwtProcessor.createAuthJwtToken(userAccount);

  response.addHeader(JwtProperties.HEADER_STRING, JwtProperties.TOKEN_PREFIX + " " + jwtToken);
}
```

- 인증에 성공할 시 실행되는 Method
- 인증에 성공할 시 인증된 Account의 정보를 통해 JWT Token을 만들고 헤더(Authentication 헤더)에 포함시킨다.

#### **JwtAuthorizationFilter**

```java
public class JwtAuthorizationFilter extends BasicAuthenticationFilter {

  private final AccountRepository accountRepository;
  private final JwtProcessor jwtProcessor;

  public JwtAuthorizationFilter(AuthenticationManager authenticationManager, AccountRepository accountRepository,
                                JwtProcessor jwtProcessor) {
    super(authenticationManager);
    this.accountRepository = accountRepository;
    this.jwtProcessor = jwtProcessor;
  }

  @Override
  protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
          throws IOException, ServletException {
    String jwtHeader = request.getHeader(JwtProperties.HEADER_STRING);

    if (jwtHeader == null || !jwtHeader.startsWith(JwtProperties.TOKEN_PREFIX)) {
      chain.doFilter(request, response);
      return;
    }

    String jwtToken = jwtProcessor.extractBearer(jwtHeader);
    String username = jwtProcessor.decodeJwtToken(jwtToken, JwtProperties.SECRET, "username");

    if (username != null) {
      Account account = accountRepository.findByUsername(username)
              .orElseThrow(() -> new NonExistResourceException("해당 username을 갖는 Account를 찾을 수 없습니다."));

      UserAccount userAccount = new UserAccount(account);
      Authentication authentication = new UsernamePasswordAuthenticationToken(userAccount, null,
              userAccount.getAuthorities());

      SecurityContextHolder.getContext().setAuthentication(authentication);
    }
    chain.doFilter(request, response);
  }
}
```

- JWT로 인가를 하기 위한 클래스
- 헤더를 통한 인증 시 적용되는 BasicAuthenticationFilter를 상속받는다.
- BasicAuthenticationFilter는 AuthenticationManager를 사용하기 때문에 super를 사용해서 주입해준다.

#### **doFilterInternal**

```java
@Override
protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
        throws IOException, ServletException {
  String jwtHeader = request.getHeader(JwtProperties.HEADER_STRING);

  if (jwtHeader == null || !jwtHeader.startsWith(JwtProperties.TOKEN_PREFIX)) {
    chain.doFilter(request, response);
    return;
  }

  String jwtToken = jwtProcessor.extractBearer(jwtHeader);
  String username = jwtProcessor.decodeJwtToken(jwtToken, JwtProperties.SECRET, "username");

  if (username != null) {
    Account account = accountRepository.findByUsername(username)
            .orElseThrow(() -> new NonExistResourceException("해당 username을 갖는 Account를 찾을 수 없습니다."));

    UserAccount userAccount = new UserAccount(account);
    Authentication authentication = new UsernamePasswordAuthenticationToken(userAccount, null,
            userAccount.getAuthorities());

    SecurityContextHolder.getContext().setAuthentication(authentication);
  }
  chain.doFilter(request, response);
}
```

- 필터 적용 시 실행되는 Method.
- 헤더에 담겨있는 JWT Token을 디코딩해서 얻은 username값이 올바른지 판단하고 username으로 DB에서 Account를 찾아온다.
- 찾아진 Account로 만든 Authentication 객체를 SecurityContextHolder에 넣어서 인가를 처리한다.