package Hampus.place.redis;

import Hampus.place.Pixel;
import com.fasterxml.jackson.databind.type.TypeFactory;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.connection.jedis.JedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.listener.ChannelTopic;
import org.springframework.data.redis.serializer.Jackson2JsonRedisSerializer;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class RedisMessagePublisher{

  private RedisTemplate<String, Pixel> redisTemplate;

  @Autowired
  private ChannelTopic topic;

  public RedisMessagePublisher() {
    redisTemplate = new RedisTemplate<>();
    redisTemplate.setConnectionFactory(new JedisConnectionFactory());
    redisTemplate.afterPropertiesSet();
    redisTemplate.setValueSerializer(new Jackson2JsonRedisSerializer(Pixel.class));
  }

  public void publish(Pixel p) {
    log.info("Publishing a pixel to redis: {}", p);
    redisTemplate.convertAndSend(topic.getTopic(), p);
  }
}
