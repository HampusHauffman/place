package Hampus.place.redis;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.connection.jedis.JedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.listener.ChannelTopic;
import org.springframework.stereotype.Component;

@Component
public class RedisMessagePublisher{

  private StringRedisTemplate redisTemplate;

  @Autowired
  private ChannelTopic topic;

  public RedisMessagePublisher() {
    redisTemplate = new StringRedisTemplate();
    redisTemplate.setConnectionFactory(new JedisConnectionFactory());
    redisTemplate.afterPropertiesSet();
  }

  public void publish(String message) {
    redisTemplate.convertAndSend(topic.getTopic(), message);
  }
}
