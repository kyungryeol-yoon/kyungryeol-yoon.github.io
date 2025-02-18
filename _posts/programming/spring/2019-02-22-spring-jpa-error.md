---
title: "[Spring] JPA (Hibernate) - Error (creating bean with name 'entityManagerFactory')"
date: 2019-02-22
categories: [Programming, Spring]
tags: [Spring, Java, Programming, JPA, Error]
---

## JDK를 openjdk11로 변경했더니 startup할 때 오류가 발생

```bash
ERROR o.s.boot.SpringApplication - Application run failed
org.springframework.beans.factory.BeanCreationException: Error creating bean with name 'entityManagerFactory' defined in class path resource [org/springframework/boot/autoconfigure/orm/jpa/HibernateJpaConfiguration.class]: Invocation of init method failed; nested exception is javax.persistence.PersistenceException: [PersistenceUnit: default] Unable to build Hibernate SessionFactory; nested exception is org.hibernate.MappingException: Could not get constructor for org.hibernate.persister.entity.SingleTableEntityPersister
at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.initializeBean(AbstractAutowireCapableBeanFactory.java:1699)
at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.doCreateBean(AbstractAutowireCapableBeanFactory.java:573)
at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.createBean(AbstractAutowireCapableBeanFactory.java:495)
at org.springframework.beans.factory.support.AbstractBeanFactory.lambda$doGetBean$0(AbstractBeanFactory.java:317)
at org.springframework.beans.factory.support.DefaultSingletonBeanRegistry.getSingleton(DefaultSingletonBeanRegistry.java:222)
at org.springframework.beans.factory.support.AbstractBeanFactory.doGetBean(AbstractBeanFactory.java:315)
at org.springframework.beans.factory.support.AbstractBeanFactory.getBean(AbstractBeanFactory.java:199)
at org.springframework.context.support.AbstractApplicationContext.getBean(AbstractApplicationContext.java:1089)
at org.springframework.context.support.AbstractApplicationContext.finishBeanFactoryInitialization(AbstractApplicationContext.java:859)
at org.springframework.context.support.AbstractApplicationContext.refresh(AbstractApplicationContext.java:550)
at org.springframework.boot.web.servlet.context.ServletWebServerApplicationContext.refresh(ServletWebServerApplicationContext.java:140)
at org.springframework.boot.SpringApplication.refresh(SpringApplication.java:762)
at org.springframework.boot.SpringApplication.refreshContext(SpringApplication.java:398)
at org.springframework.boot.SpringApplication.run(SpringApplication.java:330)
at org.springframework.boot.SpringApplication.run(SpringApplication.java:1258)
at org.springframework.boot.SpringApplication.run(SpringApplication.java:1246)
at com.yhkim.study.FirstprojectApplication.main(FirstprojectApplication.java:10)
Caused by: javax.persistence.PersistenceException: [PersistenceUnit: default] Unable to build Hibernate essionFactory; nested exception is org.hibernate.MappingException: Could not get constructor for org.hibernate.persister.entity.SingleTableEntityPersister
at org.springframework.orm.jpa.AbstractEntityManagerFactoryBean.buildNativeEntityManagerFactory(AbstractEntityManagerFactoryBean.java:402)
at org.springframework.orm.jpa.AbstractEntityManagerFactoryBean.afterPropertiesSet(AbstractEntityManagerFactoryBean.java:377)
at org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean.afterPropertiesSet(LocalContainerEntityManagerFactoryBean.java:341)
at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.invokeInitMethods(AbstractAutowireCapableBeanFactory.java:1758)
at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.initializeBean(AbstractAutowireCapableBeanFactory.java:1695)
... 16 common frames omitted
Caused by: org.hibernate.MappingException: Could not get constructor for org.hibernate.persister.entity.SingleTableEntityPersister
at org.hibernate.persister.internal.PersisterFactoryImpl.createEntityPersister(PersisterFactoryImpl.java:123)
at org.hibernate.persister.internal.PersisterFactoryImpl.createEntityPersister(PersisterFactoryImpl.java:77)
at org.hibernate.metamodel.internal.MetamodelImpl.initialize(MetamodelImpl.java:129)
at org.hibernate.internal.SessionFactoryImpl.<init>(SessionFactoryImpl.java:300)
at org.hibernate.boot.internal.SessionFactoryBuilderImpl.build(SessionFactoryBuilderImpl.java:462)
at org.hibernate.jpa.boot.internal.EntityManagerFactoryBuilderImpl.build(EntityManagerFactoryBuilderImpl.java:892)
at org.springframework.orm.jpa.vendor.SpringHibernateJpaPersistenceProvider.createContainerEntityManagerFactory(SpringHibernateJpaPersistenceProvider.java:57)
at org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean.createNativeEntityManagerFactory(LocalContainerEntityManagerFactoryBean.java:365)
at org.springframework.orm.jpa.AbstractEntityManagerFactoryBean.buildNativeEntityManagerFactory(AbstractEntityManagerFactoryBean.java:390)
... 20 common frames omitted
Caused by: org.hibernate.HibernateException: Unable to instantiate default tuplizer [org.hibernate.tuple.entity.PojoEntityTuplizer]
at org.hibernate.tuple.entity.EntityTuplizerFactory.constructTuplizer(EntityTuplizerFactory.java:91)
at org.hibernate.tuple.entity.EntityTuplizerFactory.constructDefaultTuplizer(EntityTuplizerFactory.java:116)
at org.hibernate.tuple.entity.EntityMetamodel.<init>(EntityMetamodel.java:382)
at org.hibernate.persister.entity.AbstractEntityPersister.<init>(AbstractEntityPersister.java:519)
at org.hibernate.persister.entity.SingleTableEntityPersister.<init>(SingleTableEntityPersister.java:124)
at java.base/jdk.internal.reflect.NativeConstructorAccessorImpl.newInstance0(Native Method)
at java.base/jdk.internal.reflect.NativeConstructorAccessorImpl.newInstance(NativeConstructorAccessorImpl.java:62)
at java.base/jdk.internal.reflect.DelegatingConstructorAccessorImpl.newInstance(DelegatingConstructorAccessorImpl.java:45)
at java.base/java.lang.reflect.Constructor.newInstance(Constructor.java:490)
at org.hibernate.persister.internal.PersisterFactoryImpl.createEntityPersister(PersisterFactoryImpl.java:96)
... 28 common frames omitted
Caused by: java.lang.reflect.InvocationTargetException: null
at java.base/jdk.internal.reflect.NativeConstructorAccessorImpl.newInstance0(Native Method)
at java.base/jdk.internal.reflect.NativeConstructorAccessorImpl.newInstance(NativeConstructorAccessorImpl.java:62)
at java.base/jdk.internal.reflect.DelegatingConstructorAccessorImpl.newInstance(DelegatingConstructorAccessorImpl.java:45)
at java.base/java.lang.reflect.Constructor.newInstance(Constructor.java:490)
at org.hibernate.tuple.entity.EntityTuplizerFactory.constructTuplizer(EntityTuplizerFactory.java:88)
... 37 common frames omitted
Caused by: java.lang.NullPointerException: null
at javassist.util.proxy.SecurityActions.setAccessible(SecurityActions.java:103)
at javassist.util.proxy.DefineClassHelper.toClass3(DefineClassHelper.java:151)
at javassist.util.proxy.DefineClassHelper.toClass2(DefineClassHelper.java:134)
at javassist.util.proxy.DefineClassHelper.toClass(DefineClassHelper.java:95)
at javassist.util.proxy.FactoryHelper.toClass(FactoryHelper.java:131)
at javassist.util.proxy.ProxyFactory.createClass3(ProxyFactory.java:530)
at javassist.util.proxy.ProxyFactory.createClass2(ProxyFactory.java:515)
at javassist.util.proxy.ProxyFactory.createClass1(ProxyFactory.java:451)
at javassist.util.proxy.ProxyFactory.createClass(ProxyFactory.java:422)
at org.hibernate.proxy.pojo.javassist.JavassistProxyFactory.postInstantiate(JavassistProxyFactory.java:75)
at org.hibernate.tuple.entity.PojoEntityTuplizer.buildProxyFactory(PojoEntityTuplizer.java:162)
at org.hibernate.tuple.entity.AbstractEntityTuplizer.<init>(AbstractEntityTuplizer.java:156)
at org.hibernate.tuple.entity.PojoEntityTuplizer.<init>(PojoEntityTuplizer.java:58)
... 42 common frames omitted
```

## 원인

- JPA(Hibernate)라는 것은 결국 BCI방식으로 class load시점에 entity와 JPA Interface를 이용하여 SQL문을 자동 생성하여 삽입시켜주는 역할
- 로그를 보면 org.hibernate.persister.entity.SingleTableEntityPersister의 생성자에서 그 역할을 하는듯 하다. 
- 그런데 openjdk11에서는 javaassist가 removed 되었는지 entityManagerFactory 빈을 생성할 때 
  - `at javassist.util.proxy.SecurityActions.setAccessible(SecurityActions.java:103)`에서 NullPointerException이 발생한다. 

## 해결

- pom.xml에 javassist에 대한 dependency를 추가해주면 된다.

  ```xml
  <dependency>
    <groupId>org.javassist</groupId>
    <artifactId>javassist</artifactId>
    <version>3.23.1-GA</version>
  </dependency>
  ```