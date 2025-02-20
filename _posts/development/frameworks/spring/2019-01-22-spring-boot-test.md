---
title: "[Spring Boot] Spring Boot Test"
date: 2019-01-22
categories: [Framework, Spring]
tags: [spring, java, test]
---

| Annotation | 설명 | Bean |
|:-|:-|:-|
| @SpringBootTest | 통합 테스트, 전체 | Bean 전체 |
| @WebMvcTest | 단위 테스트, Mvc 테스트 | MVC 관련된 Bean |
| @DataJpaTest | 단위 테스트, Jpa 테스트 | JPA 관련 Bean |
| @RestClientTest | 단위 테스트, Rest API 테스트 | 일부 Bean |
| @JsonTest | 단위 테스트, Json 테스트 | 일부 Bean |

## **Spring Boot Test**

- `@SpringBootTest`는 통합 테스트를 제공하는 기본적인 스프링 부트 테스트 Annotation이다.
  - 애플리케이션이 실행 될 때의 설정을 임의로 바꾸어 테스트를 진행할 수 있으며 여러 단위 테스트를 하나의 통합된 테스트로 수행할 때 접합한다.
- `@SpringBootTest`는 만능이다. 실제 구동되는 애플리케이션과 똑같이 애플리케이션 컨텍스트를 도르하여 테스트하기 때문에 하고 싶은 테스트를 모두수행할 수 있다.
- 애플리케이션의 설정을 모두 로드하기 때문에 애플리케이션 규모가 클수록 느려진다. 이렇게되면 단위 테스트라는 의미가 희석된다.
- Test Scope Dependencies 아래의 의존성을 자동으로 갖는다.
  - JUnit: The de-facto standard for unit testing Java applications.
  - Spring Test & Spring Boot Test: Utilities and integration test support for Spring Boot applications.
  - AssertJ: A fluent assertion library.
  - Hamcrest: A library of matcher objects (also known as constraints or predicates).
  - Mockito: A Java mocking framework.
  - JSONassert: An assertion library for JSON.
  - JsonPath: XPath for JSON.
- `@RunWith` 어노태이션을 사용하면 JUnit에 내장된 러너를 사용하는 대신 Annotation의 정의된 러너 클래스를 사용한다.
- `@SpringBootTest` Annotation을 사용하려면 JUnit의 SpringJUnit4ClassRunner 클래스를 상속 받는 `@RunWith(SpringRynnver.class)`를 꼭 붙여서 사용해야 정상동작한다.

```java
@RunWith(SpringRunner.class)
@SpringBootTest(
      properties = {
              "property.value=propertyTest",
              "value=test"
      },
      classes = {TestApplication.class},
      webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT
)
public class TestApplicationTests {

  @Value("${value}")
  private String value;

  @Value("${property.value}")
  private String propertyValue;

  @Test
  public void contextLoads() {
    assertThat(value, is("test"));
    assertThat(propertyValue, is("propertyTest"));
  }

}
```

- `properties`: 테스트가 실행되기전에 `{key=value}` 형식으로 프로퍼티를 추가할 수 있다.
- `classes`: 애플리케이션 컨텍스트에 로드할 클래스를 지정한다. 따로 지정하지 않으면 `@SprongBootConfiguration`을 찾아서 로드한다.
- `webEnvironment`: 애플리케이션이 실행될 때의 웹 환경을 설정할 수 있다. 기본값은 Mock 서블릿을 로드하여 구동되며 예제에서는 랜덤 포트값을 지정

- 프로파일 환경을 갖는다면 `@ActiveProfiles("test")`과 같은 방식으로 원하는 프로파일 환경값을 부여 가능
- 테스트에서 `@Transactional`을 사용하면 테스트를 마치고 나서 수정된 데이터가 롤백된다. 다만 테스트가 서버의 다른 스레드에서 실행 중이라면 `WebEnvironment.RANDOM_PORT, DEFINED_PORT`를 사용하여 테스트를 수행하면 트랜잭션이 롤백되지 않는다.
- `@Transactional` Annotation을 붙여주면 자동으로 rollback 처리된다.

### **@WebMvcTest**

- MVC를 위한 테스트, 웹에서 테스트하기 힘든 Controller를 테스트하는데 적합하다.
- 웹상에서 요청과 응답에 대한 테스트 진행
- Security 혹은 필터까지 자동으로 테스트하며 수동으로 추가/삭제 가능
- `@WebMvcTest` Annotation을 사용하면 MVC 관련된 설정인 `@Controller`, `@ControllerAdvice`, `@JsonCompoent`와 `Filter`, `WebMvcConfiguer`, `HandlerMetohdAgumentResolver`만 로드되기 때문에 `@SpringBootTest` Annotation 보다 가볍게 테스트할수 있다.

```java
@RunWith(SpringRunner.class)
@WebMvcTest(BookApi.class)
public class BookApiTest {

  @Autowired
  private MockMvc mvc;

  @MockBean
  private BookService bookService;

  @Test
  public void getBook_test() throws Exception {
    //given
    final Book book = new Book(1L, "title", 1000D);

    given(bookService.getBook()).willReturn(book);

    //when
    final ResultActions actions = mvc.perform(get("/books/{id}", 1L)
          .contentType(MediaType.APPLICATION_JSON_UTF8))
          .andDo(print());

    //then
    actions
          .andExpect(status().isOk())
          .andExpect(jsonPath("id").value(1L))
          .andExpect(jsonPath("title").value("title"))
          .andExpect(jsonPath("price").value(1000D))
    ;

  }
}
```

- `@WebMvcTest`를 사용하기 위해 테스트할 특정 Controller 클래스를 명시 해야한다.
- 주입된 MockMvc는 Controller 테스트시 모든 의존성을 로드하는 것이아닌 BookApi 관련된 Bean만 로드하여 가벼운 MVC 테스트를 수행한다.
- `@Service` Annotation은 `@WebMvcTest` 적용대상입니다. `BookService` 인터페이스를 구현한 구현체는 없지만 `@MockBean`을 이용해서 `BookService` Mock 객체로 대체했다.
- given에서 해당 객체를 생성한다.
- `when`에서 Mock 객체를 기반으로 미리 정의된 객체를 반환 받는다.
- `then`에서 해당 객체의 응답값을 검사한다.

### **@DataJpaTest**

- `@DataJpaTest` Annotation은 JPA 관련된 설정만 로드한다.
- 데이터소스의 설정이 정상적인지, JPA를 사용하서 데이터를 제대로 생성, 수정, 삭제하는지 등의 테스트가 가능하다.
- 기본적으로 inMemory 데이터베이스를 이용한다.
- `@Entity` 클래스를 스캔하여 스프링 데이터 JPA 저장소를 구성한다.

```java
@RunWith(SpringRunner.class)
@DataJpaTest
@ActiveProfiles("test")
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
public class BookJpaTest {

  @Autowired
  private BookRepository bookRepository;

  @Test
  public void book_save_test() {
    final Book book = new Book("title", 1000D);
    final Book saveBook = bookRepository.save(book);
    assertThat(saveBook.getId(), is(notNullValue()));
  }

  @Test
  public void book_save_and_find() {
    final Book book = new Book("title", 1000D);
    final Book saveBook = bookRepository.save(book);
    final Book findBook = bookRepository.findById(saveBook.getId()).get();
    assertThat(findBook.getId(), is(notNullValue()));
  }
}
```

- `@AutoConfigureTestDatabase` Annotation의 기본 설정값인 Replace.Any를 사용하면 기본적으로 내장된 데이터소스를 사용한다.
- 위와 같이 `@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)`을 지정하면 `@ActiveProfiles("test")` 기준으로 프로파일이 설정된다.
- `@DataJpaTest`는 테스트가 끝날 때마다 자동으로 테스트에 사용한 데이터를 롤백한다.
- 데이터 베이스의 종류도 선택할 수 있다.

### **@RestClientTest**

- `@RestClientTest`는 REST 관련 테스트를 도와주는 Annotation이다.
- REST 통신의 JSON 형식이 예상대로 응답을 반환하는지 등을 테스트 한다.

```java
@RunWith(SpringRunner.class)
@RestClientTest(BookRestService.class)
public class BookRestServiceTest {

  @Rule
  public ExpectedException thrown = ExpectedException.none();

  @Autowired
  private BookRestService bookRestService;

  @Autowired
  private MockRestServiceServer server;

  @Test
  public void rest_test() {

    server.expect(requestTo("/rest/test"))
          .andRespond(
                  withSuccess(new ClassPathResource("/test.json", getClass()), MediaType.APPLICATION_JSON));

    Book book = bookRestService.getRestBook();

    assertThat(book.getId(), is(notNullValue()));
    assertThat(book.getTitle(), is("title"));
    assertThat(book.getPrice(), is(1000D));

  }
}
```

- `test.json`

```json
{
  "id": 1,
  "title": "title",
  "price": 1000
}
```

- `@RestClientTest`는 테스트 대상이 되는 Bean을 주입받는다.
- `@Rule`로 지정한 필드 값은 `@Before`, `@After` Annotation에 상관없이 하나의 테스트가 Method가 끝날 때마다 정의한 값으로 초기화 시켜준다. 테스트에서 자체적으로 자체적으로 규칙을 정의하여 재사용할 때 유용하다.
- `MockRestServiceServer`는 클라이언트와 서버 사이의 REST 테스트를 위한 객체이다. 내부에서 RestTemplate를 바인딩하여 실제로 통신이 이루어지게끔 구성할 수도 있다. 이 코드에서는 Mock 객체와 같이 실제로 통신이 이루어지지는 않지만 지정한 결로에 예상되는 반환값을 명시한다.
- `rest_test()` Method는 요청에 대한 응답과 기댓값이 같은지 테스트한다. 요청을 보내면 현지 리소스 폴더에 있는 `test.json` 데이터로 응답을 주도록 설정한다
    - Mock 객체와 비슷한 개념이다.

### **@JsonTest**

- `@JsonTest`는 JSON의 직렬화, 역직렬화를 수행하는 Library인 Gson과 Jackson의 테스트를 제공합니다.

```java
@RunWith(SpringRunner.class)
@JsonTest
public class BookJsonTest {

  @Autowired
  private JacksonTester<Book> json;

  @Test
  public void json_test() throws IOException {

    final Book book = new Book("title", 1000D);

    String content= "{\n" +
            "  \"id\": 0,\n" +
            "  \"title\": \"title\",\n" +
            "  \"price\": 1000\n" +
            "}";


    assertThat(json.parseObject(content).getTitle()).isEqualTo(book.getTitle());

    assertThat(json.write(book)).isEqualToJson("/test.json");
  }
}
```

- 객체를 직렬화 테스트 / 역직렬화 테스트