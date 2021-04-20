package Hampus.place.redis;

import javax.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.connection.jedis.JedisConnectionFactory;
import org.springframework.data.redis.listener.ChannelTopic;
import org.springframework.data.redis.listener.RedisMessageListenerContainer;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class RedisSubscriber {

  @Autowired
  private ChannelTopic topic;

  @Autowired
  RedisMessageSubscriber redisMessageSubscriber;

  @Autowired
  JedisConnectionFactory jedisConnectionFactory;


  @PostConstruct
  private void setupSub(){
    log.info("Setup Subscription");

    RedisMessageListenerContainer container
        = new RedisMessageListenerContainer();
    container.setConnectionFactory(jedisConnectionFactory);
    container.addMessageListener(redisMessageSubscriber, topic);
    container.afterPropertiesSet();
    container.start();
  }
}
