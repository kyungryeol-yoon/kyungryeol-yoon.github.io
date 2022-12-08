---
layout: post
title: "Machine Learning LSTM"
date: 2019-10-01
excerpt: "Machine Learning LSTM에 대한 설명(Keras를 이용함)"
tags: [lstm, python, jupyter, MachineLearning, DeepLearning, RNN]
comments: true
---

## Recurrent Neural Network
전통적인 Neural Network는 이전에 일어난 사건을 바탕으로 나중에 일어나는 사건을 생각하지 못한다.

Recurrent Neural Network(이하 RNN)는 이 문제를 해결하고자 하는 모델이다. RNN은 스스로를 반복하면서 이전 단계에서 얻은 정보가 지속되도록 한다.

## 긴 의존 기간으로 인한 문제점
RNN의 성공의 열쇠는 "Long Short-Term Memory Network" (이하 LSTM)의 사용이다. LSTM은 RNN의 굉장히 특별한 종류이다. 기존 RNN도 LSTM만큼 대단히 유용하지만 그 성능이 상황에 따라 그 때 그 때 다르다.



## LSTM?
이러한 RNN에 단점을 보완한 긴 의존 기간을 필요로 하는 학습을 수행할 능력이 있는 LSTM이 Hochreiter & Schmidhuber(1997)에 의해 소개되었고, 그 후에 여러 추후 연구로 계속 발전하고 있다.


## Keras LSTM
{% highlight python %}
model = keras.models.Sequential()
model.add(keras.layers.LSTM(unit=3, input_shape=(3, 5)))
{% endhighlight %}

input_shape는 (data size, time steps, features) 3차원으로 구성한다. 대부분 data size는 따로 넘기지 않는다. 보통 자동으로 전체 data size를 알 수 있기 때문이다.


Batch에 대하여
Batch는 일괄 처리되는 작업의 양이다. 위에서 설명된 data_size를 한번에 처리하는 갯수를 의미하며, batch크기에 의해 weight 변화가 일어나며 batch크기 단위로 data loading 함수도 구현이 가능하다. 주의할점은 data_size/batch_size일때 나머지가 없어야 한다.

batch 되는 양이 있다면 아래와 같이 설정할 수도 있다.

{% highlight python %}
model = keras.models.Sequential()
model.add(keras.layers.LSTM(unit=4, batch_input_shape=(3, 4, 6)))
{% endhighlight %}

batch_size, time_steps, features 각각은 3,4,6이 된다.
