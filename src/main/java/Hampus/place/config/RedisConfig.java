package Hampus.place.config;

import Hampus.place.Pixel;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.connection.RedisStandaloneConfiguration;
import org.springframework.data.redis.connection.jedis.JedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.Jackson2JsonRedisSerializer;

@Configuration
public class RedisConfig {

  @Value("${spring.redis.host}")
  String host;
  @Value("${spring.redis.port}")
  int port;

  @Bean
  public JedisConnectionFactory jedisConnectionFactory(){
    RedisStandaloneConfiguration conf = new RedisStandaloneConfiguration(host,port);
    JedisConnectionFactory jedisConnectionFactory = new JedisConnectionFactory(conf);
    jedisConnectionFactory.afterPropertiesSet();

    return jedisConnectionFactory;
  }

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
