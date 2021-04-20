package Hampus.place.config;

import Hampus.place.Pixel;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.connection.RedisStandaloneConfiguration;
import org.springframework.data.redis.connection.jedis.JedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.Jackson2JsonRedisSerializer;

@Configuration
public class RedisConfig {

  @Autowired
  RedisConnectionFactory redisConnectionFactory;

  @Autowired
  @Bean
  public  RedisTemplate<String, Pixel> redisTemplate(JedisConnectionFactory jedisConnectionFactory){
    RedisTemplate redisTemplate = new RedisTemplate<>();
    redisTemplate.setConnectionFactory(jedisConnectionFactory);
    redisTemplate.afterPropertiesSet();
    redisTemplate.setValueSerializer(new Jackson2JsonRedisSerializer(Pixel.class));
    return redisTemplate;
  }

}
